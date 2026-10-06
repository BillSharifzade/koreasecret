'use client';
import { produce, setAutoFreeze, type Draft } from 'immer';
import { useSyncExternalStore } from 'react';
import { setAssetOverrides } from '@/lib/asset';
import { broadcast, idbGet, idbSet, type PendingUpload } from '@/lib/bridge';
import { publishedContent, setContent } from '@/lib/data';
import type { SiteContent } from '@/lib/types';
import { CONTENT_PATH, defaultBranch, defaultRepo, GitHub, type GhUser } from './github';
import { normalizeContent } from './schema';

/*
 * The admin's state. `base` is the content as published (in the repository), `draft` is what is being edited.
 * Every edit goes through edit(), which keeps an undo history, saves the draft to IndexedDB (it survives reloads)
 * and broadcasts it to storefront tabs open in preview mode. The draft also becomes the content of this tab, so
 * the storefront components used for previews inside the panel render it.
 */

setAutoFreeze(false);

export interface Session { mode: 'github' | 'local'; token?: string; repo: string; branch: string; user?: GhUser; remember?: boolean }
export interface DeployStep { name: string; status: string; conclusion: string | null }
export interface Deploy {
  commit: string;
  url?: string;
  message: string;
  startedAt: number;
  phase: 'waiting' | 'queued' | 'in_progress' | 'success' | 'failure' | 'unknown';
  runUrl?: string;
  steps?: DeployStep[];
  finishedAt?: number;
}
export interface UploadMeta { path: string; name: string; size: number; type: string; addedAt: number }

export interface AdminState {
  ready: boolean;
  session: Session | null;
  base: SiteContent;
  baseSha: string | null;
  baseCommit: string | null;
  draft: SiteContent;
  savedAt: number | null;
  history: { undo: string[]; redo: string[] };
  remote: { state: 'idle' | 'loading' | 'error'; error?: string; checkedAt?: number };
  deploy: Deploy | null;
  uploads: UploadMeta[];
}

const SESSION_KEY = 'ks.admin.session';

let state: AdminState = {
  ready: false,
  session: null,
  base: publishedContent(),
  baseSha: null,
  baseCommit: null,
  draft: publishedContent(),
  savedAt: null,
  history: { undo: [], redo: [] },
  remote: { state: 'idle' },
  deploy: null,
  uploads: []
};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const getState = () => state;
export function setState(patch: Partial<AdminState> | ((s: AdminState) => Partial<AdminState>)) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  const prevDraft = state.draft;
  state = { ...state, ...p };
  if (state.draft !== prevDraft) onDraftChanged();
  emit();
}
export const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };

/** Select a slice of the admin state; re-renders only when the slice changes (by reference). */
export function useAdmin<T>(select: (s: AdminState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}

/* ---------- draft → this tab's content, IndexedDB, preview tabs ---------- */
let raf = 0;
let saveTimer = 0;
function onDraftChanged() {
  if (typeof window === 'undefined') return;
  if (!raf) raf = requestAnimationFrame(() => { raf = 0; setContent(state.draft, { showHidden: true }); });
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(async () => {
    const d = state.draft;
    await idbSet('draft', d);
    broadcast({ type: 'draft', content: d });
    state = { ...state, savedAt: Date.now() };
    emit();
  }, 350);
}

/* ---------- undo / redo ---------- */
interface Snap { draft: SiteContent; label: string }
const undoStack: Snap[] = [];
const redoStack: Snap[] = [];
let lastKey: string | undefined;
let lastAt = 0;
const labels = () => ({ undo: undoStack.map((s) => s.label), redo: redoStack.map((s) => s.label) });

/**
 * Change the draft. `label` names the step in the undo history; edits with the same `key` within a second
 * (typing in one field) merge into one step.
 */
export function edit(recipe: (d: Draft<SiteContent>) => void, opts: { label?: string; key?: string } = {}) {
  const next = produce(state.draft, recipe);
  if (next === state.draft) return;
  const now = Date.now();
  if (!(opts.key && opts.key === lastKey && now - lastAt < 1000)) {
    undoStack.push({ draft: state.draft, label: opts.label || 'Изменение' });
    if (undoStack.length > 200) undoStack.shift();
  }
  lastKey = opts.key;
  lastAt = now;
  redoStack.length = 0;
  setState({ draft: next, history: labels() });
}

/** Replace the whole draft (import, version restore) as one undoable step. */
export function replaceDraft(content: SiteContent, label: string) {
  undoStack.push({ draft: state.draft, label });
  redoStack.length = 0;
  lastKey = undefined;
  setState({ draft: content, history: labels() });
}

export function undo() {
  const s = undoStack.pop();
  if (!s) return null;
  redoStack.push({ draft: state.draft, label: s.label });
  lastKey = undefined;
  setState({ draft: s.draft, history: labels() });
  return s.label;
}
export function redo() {
  const s = redoStack.pop();
  if (!s) return null;
  undoStack.push({ draft: state.draft, label: s.label });
  lastKey = undefined;
  setState({ draft: s.draft, history: labels() });
  return s.label;
}

/** Throw away every unpublished change. */
export function discardDraft() {
  replaceDraft(state.base, 'Отмена всех изменений');
}

/* ---------- session ---------- */
function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}
function writeSession(s: Session | null) {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    if (s) (s.remember ? window.localStorage : window.sessionStorage).setItem(SESSION_KEY, JSON.stringify(s));
  } catch { /* storage blocked */ }
}

export const github = () => {
  const s = state.session;
  return s?.mode === 'github' && s.token ? new GitHub(s.token, s.repo, s.branch) : null;
};

/** Check a token and open a GitHub session (throws a readable error). */
export async function loginGithub(token: string, repo: string, branch: string, remember: boolean) {
  const gh = new GitHub(token.trim(), repo.trim(), branch.trim());
  const [user, info] = await Promise.all([gh.user(), gh.repoInfo()]);
  if (info.permissions && info.permissions.push === false) throw new Error(`У ${user.login} нет прав на запись в ${info.full_name}`);
  const session: Session = { mode: 'github', token: token.trim(), repo: info.full_name, branch: branch.trim() || info.default_branch, user, remember };
  writeSession(session);
  setState({ session });
  await refreshRemote();
}

export function loginLocal() {
  const session: Session = { mode: 'local', repo: defaultRepo(), branch: defaultBranch(), remember: true };
  writeSession(session);
  setState({ session });
}

export function logout() {
  writeSession(null);
  setState({ session: null });
}

/* ---------- loading ---------- */
let booted = false;
/** Restore the session, the draft and pending uploads; then fetch the published content from GitHub. */
export async function boot() {
  if (booted) return;
  booted = true;
  const session = readSession();
  const [base, draft, meta, uploads, deploy] = await Promise.all([
    idbGet<SiteContent>('base'), idbGet<SiteContent>('draft'), idbGet<{ baseSha: string | null; baseCommit: string | null; savedAt: number | null }>('meta'),
    idbGet<PendingUpload[]>('uploads'), idbGet<Deploy>('deploy')
  ]);
  const b = base ? safeNormalize(base) : publishedContent();
  const d = draft ? safeNormalize(draft) : b;
  await refreshUploadUrls(uploads || []);
  state = {
    ...state,
    ready: true,
    session,
    base: b,
    draft: d,
    baseSha: meta?.baseSha ?? null,
    baseCommit: meta?.baseCommit ?? null,
    savedAt: meta?.savedAt ?? null,
    uploads: (uploads || []).map(({ blob: _b, ...m }) => m),
    deploy: deploy || null
  };
  setContent(state.draft, { showHidden: true });
  emit();
  // preview frames read the draft from IndexedDB: make sure it is there even before the first edit
  if (!draft) idbSet('draft', d);
  if (session?.mode === 'github') refreshRemote().catch(() => {});
}
function safeNormalize(c: SiteContent) { try { return normalizeContent(c); } catch { return publishedContent(); } }

/**
 * Fetch content/site.json from the branch. With no local changes the draft follows the new version; otherwise the
 * draft is kept and compared against it (the change list then shows what differs from the live site).
 */
export async function refreshRemote(): Promise<'same' | 'updated' | 'kept-draft'> {
  const gh = github();
  if (!gh) return 'same';
  setState({ remote: { state: 'loading' } });
  try {
    const head = await gh.head();
    const file = await gh.file(CONTENT_PATH, head.commit);
    if (!file) throw new Error(`В ветке ${gh.branch} нет файла ${CONTENT_PATH}`);
    if (file.sha === state.baseSha) {
      setState({ baseCommit: head.commit, remote: { state: 'idle', checkedAt: Date.now() } });
      await saveMeta();
      return 'same';
    }
    const remote = normalizeContent(JSON.parse(file.text));
    const clean = JSON.stringify(state.draft) === JSON.stringify(state.base);
    setState({ base: remote, baseSha: file.sha, baseCommit: head.commit, ...(clean ? { draft: remote } : null), remote: { state: 'idle', checkedAt: Date.now() } });
    await idbSet('base', remote);
    await saveMeta();
    return clean ? 'updated' : 'kept-draft';
  } catch (e) {
    setState({ remote: { state: 'error', error: e instanceof Error ? e.message : String(e), checkedAt: Date.now() } });
    throw e;
  }
}

export async function saveMeta() {
  await idbSet('meta', { baseSha: state.baseSha, baseCommit: state.baseCommit, savedAt: state.savedAt });
}

/* ---------- pending uploads (images not published yet) ---------- */
const urls = new Map<string, string>();
async function refreshUploadUrls(list: PendingUpload[]) {
  const keep = new Set(list.map((u) => u.path));
  for (const [k, v] of urls) if (!keep.has(k)) { URL.revokeObjectURL(v); urls.delete(k); }
  for (const u of list) if (!urls.has(u.path)) urls.set(u.path, URL.createObjectURL(u.blob));
  setAssetOverrides(Object.fromEntries(urls));
}
export async function addPendingUpload(u: PendingUpload) {
  const list = ((await idbGet<PendingUpload[]>('uploads')) || []).filter((x) => x.path !== u.path);
  list.push(u);
  await idbSet('uploads', list);
  await refreshUploadUrls(list);
  setState({ uploads: list.map(({ blob: _b, ...m }) => m) });
  broadcast({ type: 'uploads' });
}
export async function removePendingUploads(paths: string[]) {
  const drop = new Set(paths);
  const list = ((await idbGet<PendingUpload[]>('uploads')) || []).filter((x) => !drop.has(x.path));
  await idbSet('uploads', list);
  await refreshUploadUrls(list);
  setState({ uploads: list.map(({ blob: _b, ...m }) => m) });
  broadcast({ type: 'uploads' });
}
export const pendingUploads = async () => (await idbGet<PendingUpload[]>('uploads')) || [];

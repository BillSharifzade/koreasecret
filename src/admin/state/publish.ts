'use client';
import { idbSet } from '@/lib/bridge';
import { CONTENT_PATH, GitHubError, pagesUrl } from './github';
import { contentImages } from './media';
import { serialize } from './schema';
import { getState, github, pendingUploads, removePendingUploads, saveMeta, setState, type Deploy } from './store';
import { validate } from './validate';

export class ConflictError extends Error {}

export type PublishStage = 'check' | 'upload' | 'commit' | 'done';

/**
 * Publish the draft: one commit with content/site.json and the pictures it uses. Refuses when the file changed on
 * GitHub since it was loaded (someone else published), unless `overwrite` is set.
 */
export async function publish(message: string, opts: { overwrite?: boolean; onStage?: (s: PublishStage, detail?: string) => void } = {}) {
  const gh = github();
  if (!gh) throw new Error('Публикация доступна после входа через GitHub');
  const st = getState();
  const errors = validate(st.draft).filter((i) => i.level === 'error');
  if (errors.length) throw new Error(`Исправьте ошибки перед публикацией (${errors.length})`);

  opts.onStage?.('check');
  const head = await gh.head();
  if (!opts.overwrite && head.commit !== st.baseCommit) {
    const sha = await gh.fileSha(CONTENT_PATH, head.commit);
    if (sha && st.baseSha && sha !== st.baseSha) throw new ConflictError('Пока вы редактировали, на сайте опубликовали другую версию');
  }

  // pictures waiting for upload that the draft actually uses
  const used = new Set(contentImages(st.draft).map((x) => x.path));
  const uploads = (await pendingUploads()).filter((u) => used.has(u.path));
  opts.onStage?.('upload', uploads.length ? `${uploads.length} фото` : undefined);

  const draft = { ...st.draft, meta: { ...st.draft.meta, updatedAt: new Date().toISOString() } };
  const files = [
    ...uploads.map((u) => ({ path: 'public' + u.path, content: u.blob as Blob })),
    { path: CONTENT_PATH, content: serialize(draft) }
  ];
  opts.onStage?.('commit');
  let res;
  try {
    res = await gh.commit(files, message.trim() || 'Обновление контента', head, (d, t) => opts.onStage?.('upload', `${d} из ${t}`));
  } catch (e) {
    if (e instanceof GitHubError && (e.status === 409 || e.status === 422)) throw new ConflictError('Ветка изменилась во время публикации — попробуйте ещё раз');
    throw e;
  }

  const deploy: Deploy = { commit: res.sha, url: res.url, message: message.trim() || 'Обновление контента', startedAt: Date.now(), phase: 'waiting' };
  setState({ base: draft, draft, baseSha: res.blobs[CONTENT_PATH] || null, baseCommit: res.sha, deploy });
  await idbSet('base', draft);
  await idbSet('draft', draft);
  await idbSet('deploy', deploy);
  await saveMeta();
  // the uploaded pictures are in the repository now; keep showing local copies until the new site is live
  pendingToClear = uploads.map((u) => u.path);
  opts.onStage?.('done');
  trackDeploy();
  return res;
}

let pendingToClear: string[] = [];
let tracking = 0;

/** Follow the Pages workflow run of the last published commit until it finishes. */
export function trackDeploy() {
  const gh = github();
  const d0 = getState().deploy;
  if (!gh || !d0 || d0.phase === 'success' || d0.phase === 'failure') return;
  const id = ++tracking;
  const tick = async () => {
    if (id !== tracking) return;
    const d = getState().deploy;
    if (!d) return;
    try {
      const runs = await gh.runsFor(d.commit);
      const run = runs.find((r) => /pages|deploy/i.test(r.name)) || runs[0];
      let next: Deploy = { ...d };
      if (!run) {
        // the push registers within a few seconds; after 3 minutes without a run there is no workflow to wait for
        if (Date.now() - d.startedAt > 180_000) next = { ...d, phase: 'unknown', finishedAt: Date.now() };
      } else {
        const jobs = await gh.jobs(run.id).catch(() => []);
        const steps = jobs.flatMap((j) => (j.steps || []).filter((s) => !/^(Set up job|Complete job|Post )/.test(s.name)).map((s) => ({ name: `${j.name === 'deploy' ? 'Деплой: ' : ''}${STEP_NAMES[s.name] || s.name}`, status: s.status, conclusion: s.conclusion })));
        const phase: Deploy['phase'] = run.status === 'completed' ? (run.conclusion === 'success' ? 'success' : 'failure') : run.status === 'in_progress' ? 'in_progress' : 'queued';
        next = { ...d, phase, runUrl: run.html_url, steps, ...(phase === 'success' || phase === 'failure' ? { finishedAt: Date.now() } : null) };
      }
      setState({ deploy: next });
      await idbSet('deploy', next);
      if (next.phase === 'success') { if (pendingToClear.length) await removePendingUploads(pendingToClear); pendingToClear = []; return; }
      if (next.phase === 'failure' || next.phase === 'unknown') return;
    } catch { /* network blip: keep polling */ }
    window.setTimeout(tick, 4000);
  };
  tick();
}

export const siteUrl = () => {
  const s = getState().session;
  return s ? pagesUrl(s.repo) : '/';
};

const STEP_NAMES: Record<string, string> = {
  Checkout: 'Загрузка кода', 'Set up Bun': 'Подготовка Bun', 'Configure Pages': 'Настройка Pages', 'Install dependencies': 'Установка зависимостей',
  'Type-check': 'Проверка типов', 'Build static site (Next.js export)': 'Сборка сайта', 'Upload artifact': 'Упаковка', 'Deploy to GitHub Pages': 'Публикация на Pages'
};

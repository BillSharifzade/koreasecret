'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { SiteContent } from '@/lib/types';
import { diffContent, type Change } from '../state/diff';
import { ConflictError, publish, siteUrl, trackDeploy, type PublishStage } from '../state/publish';
import { serialize } from '../state/schema';
import { localDate } from '../lib/sheet';
import { discardDraft, getState, refreshRemote, useAdmin, type Deploy } from '../state/store';
import { validate, type Issue } from '../state/validate';
import { I } from '../ui/icons';
import { ago, Badge, Btn, cx, Empty, Field, Note, Seg } from '../ui/kit';
import { confirmDialog, Dialog, Sheet, toast } from '../ui/overlay';

/* ---------- memoised change list and checks (shared by every component that shows them) ---------- */
let memoDiff: { a: SiteContent; b: SiteContent; out: Change[] } | null = null;
export function changesOf(a: SiteContent, b: SiteContent) {
  if (memoDiff && memoDiff.a === a && memoDiff.b === b) return memoDiff.out;
  memoDiff = { a, b, out: diffContent(a, b) };
  return memoDiff.out;
}
let memoIssues: { c: SiteContent; out: Issue[] } | null = null;
export function issuesOf(c: SiteContent) {
  if (memoIssues && memoIssues.c === c) return memoIssues.out;
  memoIssues = { c, out: validate(c) };
  return memoIssues.out;
}
export function useChanges() {
  const base = useAdmin((s) => s.base);
  const draft = useAdmin((s) => s.draft);
  return changesOf(base, draft);
}
export function useIssues() {
  const draft = useAdmin((s) => s.draft);
  return issuesOf(draft);
}

/* ---------- open/close from anywhere (top bar, ⌘S, command palette) ---------- */
let panel: 'none' | 'publish' | 'changes' = 'none';
const pl = new Set<() => void>();
export const openPanel = (p: typeof panel) => { panel = p; pl.forEach((l) => l()); };
const usePanel = () => useSyncExternalStore((f) => { pl.add(f); return () => { pl.delete(f); }; }, () => panel, () => panel);

export function exportJson(c: SiteContent = getState().draft) {
  const blob = new Blob([serialize(c)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `site-${localDate()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const KIND: Record<Change['kind'], { sign: string; label: string }> = {
  added: { sign: '+', label: 'добавлено' }, removed: { sign: '−', label: 'удалено' }, changed: { sign: '~', label: 'изменено' }, reordered: { sign: '⇅', label: 'порядок' }
};

export function ChangeList({ changes, onNavigate, limit }: { changes: Change[]; onNavigate?: () => void; limit?: number }) {
  const groups = useMemo(() => {
    const m = new Map<string, Change[]>();
    changes.forEach((c) => m.set(c.area, [...(m.get(c.area) || []), c]));
    return [...m.entries()];
  }, [changes]);
  let shown = 0;
  if (!changes.length) return <Empty title="Изменений нет" text="Черновик совпадает с опубликованной версией сайта" icon="check-circle" />;
  return (
    <div className="a-stack">
      {groups.map(([area, list]) => {
        if (limit && shown >= limit) return null;
        const items = limit ? list.slice(0, Math.max(0, limit - shown)) : list;
        shown += items.length;
        return (
          <div key={area} className="a-stack a-stack--sm">
            <div className="a-section-title">{area} · {list.length}</div>
            <div className="a-changes">
              {items.map((c, i) => {
                const body = (
                  <>
                    <span className={cx('a-change__kind', `is-${c.kind}`)} title={KIND[c.kind].label}>{KIND[c.kind].sign}</span>
                    <span className="adm-grow" style={{ minWidth: 0 }}>
                      <span className="adm-ellipsis" style={{ display: 'block', fontWeight: 500 }}>{c.label}</span>
                      {c.fields && c.fields.length > 0 && <span className="a-change__fields">{c.fields.slice(0, 6).join(', ')}{c.fields.length > 6 ? '…' : ''}</span>}
                    </span>
                    {c.href && c.kind !== 'removed' && <I name="chev-right" className="i--sm adm-muted" />}
                  </>
                );
                return c.href && c.kind !== 'removed'
                  ? <Link key={i} className="a-change" href={c.href} onClick={onNavigate}>{body}</Link>
                  : <div key={i} className="a-change">{body}</div>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function IssueList({ issues, onNavigate }: { issues: Issue[]; onNavigate?: () => void }) {
  if (!issues.length) return <Note kind="ok">Проблем не найдено — всё готово к публикации.</Note>;
  return (
    <div className="a-changes">
      {issues.map((x, i) => (
        <Link key={i} className="a-change" href={x.href} onClick={onNavigate}>
          <span className={cx('a-change__kind', x.level === 'error' ? 'is-removed' : 'is-changed')}><I name="alert" className="i--xs" /></span>
          <span className="adm-grow" style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 500 }}>{x.message}</span>
            <span className="a-change__fields">{x.area} · {x.label}</span>
          </span>
          <I name="chev-right" className="i--sm adm-muted" />
        </Link>
      ))}
    </div>
  );
}

const PHASE: Record<Deploy['phase'], { label: string; tone: 'blue' | 'green' | 'red' | 'amber' | undefined }> = {
  waiting: { label: 'Ждём запуск сборки', tone: 'blue' }, queued: { label: 'В очереди', tone: 'blue' }, in_progress: { label: 'Сайт собирается', tone: 'blue' },
  success: { label: 'Сайт обновлён', tone: 'green' }, failure: { label: 'Сборка не удалась', tone: 'red' }, unknown: { label: 'Сборка не запустилась', tone: 'amber' }
};

/** The last publish: commit, Pages workflow steps live, link to the site. */
export function DeployCard({ deploy, compact }: { deploy: Deploy; compact?: boolean }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = window.setInterval(() => tick((n) => n + 1), 1000); return () => window.clearInterval(t); }, []);
  useEffect(() => { trackDeploy(); }, []);
  const steps = deploy.steps || [];
  const done = steps.filter((s) => s.status === 'completed').length;
  const total = Math.max(steps.length, 8);
  const busy = deploy.phase === 'waiting' || deploy.phase === 'queued' || deploy.phase === 'in_progress';
  const pct = deploy.phase === 'success' ? 100 : Math.round((done / total) * 100);
  const secs = Math.round(((deploy.finishedAt || Date.now()) - deploy.startedAt) / 1000);
  return (
    <div className="a-stack a-stack--sm">
      <div className="adm-row adm-row--between">
        <div className="adm-row" style={{ gap: 8 }}>
          <Badge tone={PHASE[deploy.phase].tone} dot>{PHASE[deploy.phase].label}</Badge>
          <span className="adm-muted" style={{ fontSize: 12.5 }}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
        </div>
        <span className="adm-muted" style={{ fontSize: 12.5 }}>{ago(deploy.startedAt)}</span>
      </div>
      <div className={cx('a-progress', busy && !steps.length && 'is-indeterminate')}><i style={{ width: `${Math.max(busy ? 6 : 0, pct)}%` }} /></div>
      <div className="adm-ellipsis" style={{ fontWeight: 500 }}>{deploy.message}</div>
      {!compact && steps.length > 0 && (
        <div className="a-steps">
          {steps.map((s, i) => {
            const st = s.status === 'completed' ? (s.conclusion === 'success' || s.conclusion === 'skipped' ? 'done' : 'fail') : s.status === 'in_progress' ? 'run' : 'wait';
            return <div key={i} className={cx('a-step', `is-${st}`)}><span className="a-step__dot"><I name={st === 'done' ? 'check' : st === 'fail' ? 'close' : st === 'run' ? 'loader' : 'clock'} /></span>{s.name}</div>;
          })}
        </div>
      )}
      {deploy.phase === 'unknown' && <Note kind="warn">Коммит сохранён, но сборка сайта не запустилась. Проверьте, что в репозитории включены GitHub Actions и Pages (Settings → Pages → Source: GitHub Actions).</Note>}
      {deploy.phase === 'failure' && <Note kind="error">Сборка завершилась с ошибкой — опубликованный сайт не изменился. Подробности — в журнале запуска на GitHub.</Note>}
      <div className="adm-row adm-row--wrap" style={{ gap: 6 }}>
        {deploy.phase === 'success' && <a className="a-btn a-btn--primary a-btn--sm" href={siteUrl()} target="_blank" rel="noopener noreferrer"><I name="external" />Открыть сайт</a>}
        {deploy.runUrl && <a className="a-btn a-btn--sm" href={deploy.runUrl} target="_blank" rel="noopener noreferrer"><I name="github" />Сборка на GitHub</a>}
        {deploy.url && <a className="a-btn a-btn--sm a-btn--ghost" href={deploy.url} target="_blank" rel="noopener noreferrer"><I name="file" />Коммит {deploy.commit.slice(0, 7)}</a>}
      </div>
    </div>
  );
}

export const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return `${n} ${a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many}`;
};
const KIND_VERB: Record<Change['kind'], string> = { added: 'добавлено', removed: 'удалено', changed: 'изменено', reordered: 'новый порядок' };
const summary = (changes: Change[]) => {
  if (changes.length === 1) { const c = changes[0]; return c.label === c.area ? `${c.area}: ${c.fields?.join(', ') || KIND_VERB[c.kind]}` : `${c.area}: ${c.label} — ${c.fields?.slice(0, 3).join(', ') || KIND_VERB[c.kind]}`; }
  const by = new Map<string, number>();
  changes.forEach((c) => by.set(c.area, (by.get(c.area) || 0) + 1));
  return [...by.entries()].slice(0, 4).map(([a, n]) => `${a}: ${n}`).join(', ') + (by.size > 4 ? '…' : '');
};

/* ---------- the publish dialog ---------- */
function PublishDialog() {
  const open = usePanel() === 'publish';
  const session = useAdmin((s) => s.session);
  const deploy = useAdmin((s) => s.deploy);
  const uploads = useAdmin((s) => s.uploads);
  const changes = useChanges();
  const issues = useIssues();
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  const [msg, setMsg] = useState('');
  const [stage, setStage] = useState<PublishStage | null>(null);
  const [detail, setDetail] = useState('');
  const [conflict, setConflict] = useState('');
  const [tab, setTab] = useState<'changes' | 'issues'>('changes');
  const close = () => { if (!stage || stage === 'done') { openPanel('none'); setStage(null); setConflict(''); } };
  useEffect(() => { if (open) { setMsg(summary(changes)); setStage(null); setConflict(''); setTab(errors.length ? 'issues' : 'changes'); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = async (overwrite = false) => {
    setConflict('');
    try {
      setStage('check');
      await publish(msg, { overwrite, onStage: (s, d) => { setStage(s); setDetail(d || ''); } });
      toast({ title: 'Опубликовано', text: 'Сайт обновится через минуту-две', kind: 'ok' });
    } catch (e) {
      setStage(null);
      if (e instanceof ConflictError) setConflict(e.message);
      else toast({ title: 'Не удалось опубликовать', text: e instanceof Error ? e.message : String(e), kind: 'error', ms: 7000 });
    }
  };
  const local = session?.mode !== 'github';
  const uploadsUsed = uploads.length;

  return (
    <Dialog open={open} onClose={close} size="wide" label="Публикация">
      {stage === 'done' && deploy ? (
        <div className="a-stack">
          <div className="a-dialog__icon"><I name="cloud" /></div>
          <div className="a-dialog__title">Изменения отправлены</div>
          <p className="adm-ink2">GitHub пересобирает сайт — обычно это занимает 1–2 минуты. Можно закрыть окно и продолжать работу: статус виден в верхней панели.</p>
          <div className="a-card a-card--soft"><DeployCard deploy={deploy} /></div>
          <div className="a-dialog__foot"><Btn variant="primary" onClick={close}>Готово</Btn></div>
        </div>
      ) : (
        <div className="a-stack">
          <div className="adm-row adm-row--between">
            <div>
              <div className="a-dialog__title">Публикация на сайт</div>
              <div className="adm-muted" style={{ marginTop: 4 }}>{changes.length ? `${plural(changes.length, 'изменение', 'изменения', 'изменений')}${uploadsUsed ? ` · ${plural(uploadsUsed, 'новое фото', 'новых фото', 'новых фото')}` : ''}` : 'Нет изменений'}</div>
            </div>
            <button type="button" className="a-icon-btn" onClick={close} aria-label="Закрыть"><I name="close" /></button>
          </div>
          {local && <Note kind="warn">Вы в демо-режиме: опубликовать на GitHub нельзя. Скачайте файл и замените им <b>content/site.json</b> в репозитории — или войдите с токеном.</Note>}
          <Seg value={tab} onChange={setTab} options={[{ value: 'changes', label: 'Изменения', count: changes.length }, { value: 'issues', label: 'Проверка', count: issues.length }]} />
          <div style={{ maxHeight: '38vh', overflow: 'auto', margin: '0 -6px', padding: '0 6px' }}>
            {tab === 'changes' ? <ChangeList changes={changes} onNavigate={close} /> : <IssueList issues={issues} onNavigate={close} />}
          </div>
          {errors.length > 0 && <Note kind="error"><b>Ошибок: {errors.length}.</b> С ними сайт может сломаться — исправьте их, и кнопка публикации станет доступна.</Note>}
          {!errors.length && warnings.length > 0 && tab === 'changes' && <Note kind="warn">Есть {warnings.length} предупреждений — публиковать можно, но загляните во вкладку «Проверка».</Note>}
          {conflict && (
            <Note kind="error">
              <b>{conflict}.</b> Можно загрузить свежую версию (ваш черновик сохранится — увидите разницу в списке изменений) или перезаписать её своей.
              <div className="adm-row" style={{ marginTop: 10, gap: 6 }}>
                <Btn size="sm" variant="white" icon="refresh" onClick={async () => { try { await refreshRemote(); setConflict(''); toast({ title: 'Загружена свежая версия', kind: 'ok' }); } catch { /* shown in status */ } }}>Загрузить свежую</Btn>
                <Btn size="sm" variant="danger" onClick={() => go(true)}>Перезаписать своей</Btn>
              </div>
            </Note>
          )}
          {!local && (
            <Field label="Описание изменений" hint="Попадёт в историю версий — по нему легко найти и откатить изменение">
              <input className="a-input" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Например: новые цены на санскрины" />
            </Field>
          )}
          {stage && stage !== 'done' && (
            <div className="a-stack a-stack--sm">
              <div className="a-progress is-indeterminate"><i /></div>
              <div className="adm-muted" style={{ fontSize: 13 }}>{stage === 'check' ? 'Проверяем, не изменился ли сайт…' : stage === 'upload' ? `Загружаем файлы${detail ? ` · ${detail}` : ''}…` : 'Сохраняем коммит…'}</div>
            </div>
          )}
          <div className="a-dialog__foot" style={{ marginTop: 4 }}>
            <Btn variant="ghost" icon="download" onClick={() => exportJson()}>Скачать JSON</Btn>
            <span className="adm-grow" />
            <Btn onClick={close} disabled={!!stage}>Отмена</Btn>
            {!local && <Btn variant="primary" icon="cloud" loading={!!stage} disabled={!changes.length || errors.length > 0} onClick={() => go()}>Опубликовать</Btn>}
          </div>
        </div>
      )}
    </Dialog>
  );
}

function ChangesSheet() {
  const open = usePanel() === 'changes';
  const changes = useChanges();
  const issues = useIssues();
  const session = useAdmin((s) => s.session);
  const deploy = useAdmin((s) => s.deploy);
  const remote = useAdmin((s) => s.remote);
  const close = () => openPanel('none');
  const [tab, setTab] = useState<'changes' | 'issues'>('changes');
  return (
    <Sheet open={open} onClose={close} title="Черновик" sub={changes.length ? `${plural(changes.length, 'неопубликованное изменение', 'неопубликованных изменения', 'неопубликованных изменений')}` : 'Всё опубликовано'}
      foot={<>
        <Btn variant="danger" icon="trash" disabled={!changes.length} onClick={async () => { if (await confirmDialog({ title: 'Отменить все изменения?', text: 'Черновик вернётся к опубликованной версии сайта. Действие можно отменить через ⌘Z.', confirm: 'Отменить изменения', danger: true })) { discardDraft(); toast({ title: 'Изменения отменены', kind: 'ok' }); } }}>Сбросить</Btn>
        <span className="adm-grow" />
        <Btn variant="primary" icon="cloud" disabled={!changes.length} onClick={() => openPanel('publish')}>{session?.mode === 'github' ? 'Опубликовать' : 'Выгрузить'}</Btn>
      </>}>
      <div className="a-stack">
        {deploy && <div className="a-card a-card--soft"><DeployCard deploy={deploy} compact /></div>}
        {remote.state === 'error' && <Note kind="error">Не удалось проверить сайт на GitHub: {remote.error}</Note>}
        <Seg value={tab} onChange={setTab} options={[{ value: 'changes', label: 'Изменения', count: changes.length }, { value: 'issues', label: 'Проверка', count: issues.length }]} />
        {tab === 'changes' ? <ChangeList changes={changes} onNavigate={close} /> : <IssueList issues={issues} onNavigate={close} />}
      </div>
    </Sheet>
  );
}

export function PublishHost() {
  return <><PublishDialog /><ChangesSheet /></>;
}

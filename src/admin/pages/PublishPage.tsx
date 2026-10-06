'use client';
import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@/lib/types';
import { ChangeList, DeployCard, exportJson, IssueList, openPanel, plural, useChanges, useIssues } from '../shell/Publish';
import { diffContent, type Change } from '../state/diff';
import { CONTENT_PATH, pagesUrl, type GhCommitInfo, type GhRun } from '../state/github';
import { normalizeContent } from '../state/schema';
import { discardDraft, github, logout, refreshRemote, replaceDraft, useAdmin } from '../state/store';
import { I } from '../ui/icons';
import { ago, Badge, Btn, Card, dt, Empty, IconBtn, Note, PageHead, Seg } from '../ui/kit';
import { confirmDialog, Dialog, toast } from '../ui/overlay';

function CompareDialog({ open, onClose, title, changes, onRestore }: { open: boolean; onClose: () => void; title: string; changes: Change[] | null; onRestore?: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} size="wide" label={title}>
      <div className="adm-row adm-row--between" style={{ marginBottom: 12 }}>
        <div><div className="a-dialog__title">{title}</div><div className="adm-muted" style={{ marginTop: 4 }}>Что изменится в черновике, если загрузить эту версию</div></div>
        <IconBtn icon="close" label="Закрыть" onClick={onClose} />
      </div>
      <div style={{ maxHeight: '55vh', overflow: 'auto' }}>{changes ? <ChangeList changes={changes} onNavigate={onClose} /> : <div className="a-empty"><div className="a-spinner" /></div>}</div>
      {onRestore && <div className="a-dialog__foot"><Btn onClick={onClose}>Отмена</Btn><Btn variant="primary" icon="history" disabled={!changes} onClick={onRestore}>Загрузить в черновик</Btn></div>}
    </Dialog>
  );
}

export function PublishPage() {
  const session = useAdmin((s) => s.session);
  const deploy = useAdmin((s) => s.deploy);
  const remote = useAdmin((s) => s.remote);
  const draft = useAdmin((s) => s.draft);
  const baseCommit = useAdmin((s) => s.baseCommit);
  const changes = useChanges();
  const issues = useIssues();
  const [tab, setTab] = useState<'changes' | 'issues'>('changes');
  const [history, setHistory] = useState<GhCommitInfo[] | null>(null);
  const [runs, setRuns] = useState<(GhRun & { head_sha: string; head_commit?: { message: string } })[] | null>(null);
  const [histErr, setHistErr] = useState('');
  const [cmp, setCmp] = useState<{ title: string; content: SiteContent | null; changes: Change[] | null } | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const gh = github();

  const loadHistory = async () => {
    if (!gh) return;
    setHistErr('');
    try { const [h, r] = await Promise.all([gh.history(CONTENT_PATH, 25), gh.latestRuns(6)]); setHistory(h); setRuns(r); }
    catch (e) { setHistErr(e instanceof Error ? e.message : String(e)); }
  };
  useEffect(() => { loadHistory(); }, [session?.repo, session?.branch, deploy?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const openVersion = async (c: GhCommitInfo) => {
    if (!gh) return;
    setCmp({ title: `Версия ${c.sha.slice(0, 7)} · ${dt(c.date)}`, content: null, changes: null });
    try {
      const f = await gh.file(CONTENT_PATH, c.sha);
      if (!f) throw new Error('В этой версии нет файла контента');
      const content = normalizeContent(JSON.parse(f.text));
      setCmp({ title: `Версия ${c.sha.slice(0, 7)} · ${dt(c.date)}`, content, changes: diffContent(draft, content) });
    } catch (e) { setCmp(null); toast({ title: 'Не удалось загрузить версию', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
  };
  const importFile = async (f?: File) => {
    if (!f) return;
    try {
      const content = normalizeContent(JSON.parse(await f.text()));
      setCmp({ title: `Файл ${f.name}`, content, changes: diffContent(draft, content) });
    } catch (e) { toast({ title: 'Файл не подходит', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
  };
  const restore = () => {
    if (!cmp?.content) return;
    replaceDraft(cmp.content, `Загружено: ${cmp.title}`);
    toast({ title: 'Версия загружена в черновик', text: 'Проверьте и опубликуйте, чтобы вернуть её на сайт', kind: 'ok' });
    setCmp(null);
  };
  const check = async () => {
    try {
      const r = await refreshRemote();
      toast({ title: r === 'same' ? 'На сайте та же версия' : r === 'updated' ? 'Загружена свежая версия сайта' : 'На сайте новая версия — ваш черновик сохранён', kind: 'ok' });
    } catch (e) { toast({ title: 'GitHub недоступен', text: e instanceof Error ? e.message : String(e), kind: 'error' }); }
  };

  return (
    <div className="adm-page">
      <PageHead title={<>Публикация и <em>версии</em></>} sub="Как изменения попадают на сайт: черновик → публикация (коммит в GitHub) → автоматическая сборка GitHub Pages. Любую прошлую версию можно сравнить и вернуть."
        actions={<>
          <Btn icon="download" onClick={() => exportJson()}>Резервная копия</Btn>
          <Btn variant="primary" icon="cloud" disabled={!changes.length} onClick={() => openPanel('publish')}>{session?.mode === 'github' ? 'Опубликовать' : 'Выгрузить'}</Btn>
        </>} />

      <div className="adm-grid adm-grid--main">
        <div className="adm-stack" style={{ minWidth: 0 }}>
          <Card title="Черновик" sub={changes.length ? `${plural(changes.length, 'изменение', 'изменения', 'изменений')} ещё не на сайте` : 'Совпадает с опубликованной версией'}
            actions={changes.length > 0 && <Btn size="sm" variant="danger" icon="trash" onClick={async () => { if (await confirmDialog({ title: 'Сбросить черновик?', text: 'Все неопубликованные изменения пропадут (⌘Z вернёт).', confirm: 'Сбросить', danger: true })) discardDraft(); }}>Сбросить</Btn>}>
            <div className="a-stack">
              <Seg value={tab} onChange={setTab} options={[{ value: 'changes', label: 'Изменения', count: changes.length }, { value: 'issues', label: 'Проверка', count: issues.length }]} />
              {tab === 'changes' ? <ChangeList changes={changes} /> : <IssueList issues={issues} />}
            </div>
          </Card>

          <Card title="История версий" sub={session?.mode === 'github' ? 'Каждая публикация — коммит в репозитории' : 'Доступна после входа через GitHub'}
            actions={gh && <IconBtn icon="refresh" label="Обновить" onClick={loadHistory} />}>
            {!gh ? <Empty title="Нет подключения к GitHub" text="В демо-режиме история хранится только в виде скачанных резервных копий" icon="history" />
              : histErr ? <Note kind="error">{histErr}</Note>
              : !history ? <div className="a-stack a-stack--sm">{[0, 1, 2].map((i) => <div key={i} className="a-skel" style={{ height: 48 }} />)}</div>
              : (
                <div className="a-changes">
                  {history.map((c, i) => (
                    <div key={c.sha} className="a-change a-version">
                      {c.avatar
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img className="a-version__avatar" src={c.avatar} alt="" />
                        : <span className="a-version__avatar"><I name="user" className="i--sm" /></span>}
                      <span className="adm-grow" style={{ minWidth: 0 }}>
                        <span className="adm-ellipsis" style={{ display: 'block', fontWeight: 500 }}>{c.message.split('\n')[0]}</span>
                        <span className="a-change__fields">{c.author} · {dt(c.date)} · <span className="adm-mono">{c.sha.slice(0, 7)}</span></span>
                      </span>
                      {c.sha === baseCommit && <Badge tone="green">на сайте</Badge>}
                      {i === 0 && c.sha !== baseCommit && <Badge tone="blue">последняя</Badge>}
                      <Btn size="sm" variant="ghost" onClick={() => openVersion(c)}>Сравнить</Btn>
                      <a className="a-icon-btn a-icon-btn--sm" href={c.url} target="_blank" rel="noopener noreferrer" aria-label="Коммит на GitHub" title="Коммит на GitHub"><I name="external" /></a>
                    </div>
                  ))}
                </div>
              )}
          </Card>
        </div>

        <div className="adm-stack">
          <Card title="Подключение">
            {session?.mode === 'github' ? (
              <div className="a-stack a-stack--sm">
                <div className="adm-row">
                  {session.user?.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img className="a-version__avatar" src={session.user.avatar_url} alt="" style={{ width: 40, height: 40 }} />
                    : null}
                  <div><b>{session.user?.name || session.user?.login}</b><div className="adm-muted" style={{ fontSize: 13 }}>@{session.user?.login}</div></div>
                </div>
                <dl className="a-dl">
                  <dt>Репозиторий</dt><dd><a className="a-link" href={`https://github.com/${session.repo}`} target="_blank" rel="noopener noreferrer">{session.repo}</a></dd>
                  <dt>Ветка</dt><dd className="adm-mono">{session.branch}</dd>
                  <dt>Файл</dt><dd className="adm-mono">{CONTENT_PATH}</dd>
                  <dt>Сайт</dt><dd><a className="a-link" href={pagesUrl(session.repo)} target="_blank" rel="noopener noreferrer">{pagesUrl(session.repo).replace('https://', '')}</a></dd>
                  <dt>Проверено</dt><dd>{remote.checkedAt ? ago(remote.checkedAt) : '—'}</dd>
                </dl>
                {remote.state === 'error' && <Note kind="error">{remote.error}</Note>}
                <div className="adm-row adm-row--wrap" style={{ gap: 6 }}>
                  <Btn size="sm" icon="refresh" loading={remote.state === 'loading'} onClick={check}>Проверить сайт</Btn>
                  <Btn size="sm" variant="ghost" icon="logout" onClick={logout}>Сменить токен</Btn>
                </div>
              </div>
            ) : (
              <div className="a-stack a-stack--sm">
                <Note kind="warn">Демо-режим: изменения живут только в этом браузере.</Note>
                <p className="adm-ink2" style={{ fontSize: 13.5 }}>Чтобы опубликовать без токена: нажмите «Резервная копия», замените скачанным файлом <span className="adm-mono">content/site.json</span> в репозитории и отправьте коммит — сайт пересоберётся сам.</p>
                <Btn icon="github" variant="dark" onClick={logout}>Войти через GitHub</Btn>
              </div>
            )}
          </Card>
          {deploy && <Card title="Последняя публикация"><DeployCard deploy={deploy} /></Card>}
          {runs && runs.length > 0 && (
            <Card title="Сборки сайта" sub="GitHub Actions">
              <div className="a-changes">
                {runs.map((r) => (
                  <a key={r.id} className="a-change" href={r.html_url} target="_blank" rel="noopener noreferrer">
                    <span className={`a-change__kind ${r.status !== 'completed' ? 'is-reordered' : r.conclusion === 'success' ? 'is-added' : 'is-removed'}`}><I name={r.status !== 'completed' ? 'loader' : r.conclusion === 'success' ? 'check' : 'close'} className="i--xs" /></span>
                    <span className="adm-grow" style={{ minWidth: 0 }}><span className="adm-ellipsis" style={{ display: 'block', fontWeight: 500 }}>{r.head_commit?.message?.split('\n')[0] || r.name}</span><span className="a-change__fields">{ago(r.created_at)} · {r.status === 'completed' ? (r.conclusion === 'success' ? 'успешно' : r.conclusion) : 'идёт'}</span></span>
                  </a>
                ))}
              </div>
            </Card>
          )}
          <Card title="Резервные копии">
            <div className="a-stack a-stack--sm">
              <p className="adm-ink2" style={{ fontSize: 13.5 }}>Весь контент сайта — один JSON-файл. Скачайте копию перед большими изменениями; загрузите файл, чтобы восстановить (сначала покажем, что изменится).</p>
              <div className="adm-row adm-row--wrap" style={{ gap: 6 }}>
                <Btn size="sm" icon="download" onClick={() => exportJson()}>Скачать черновик</Btn>
                <Btn size="sm" icon="upload" onClick={() => file.current?.click()}>Загрузить из файла</Btn>
              </div>
              <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
          </Card>
          <Card title="Как это устроено" soft>
            <ol className="a-howto">
              <li><b>Черновик.</b> Все правки сохраняются в браузере сразу, с отменой (⌘Z) и предпросмотром на сайте.</li>
              <li><b>Публикация.</b> Один коммит в GitHub: <span className="adm-mono">content/site.json</span> и новые картинки в <span className="adm-mono">public/uploads/</span>.</li>
              <li><b>Сборка.</b> GitHub Actions пересобирает сайт и выкладывает на Pages за 1–2 минуты — ход виден здесь.</li>
              <li><b>Откат.</b> Любую версию из истории можно загрузить в черновик и опубликовать снова.</li>
            </ol>
            <Note icon="settings">Нужно один раз: Settings → Pages → Source: <b>GitHub Actions</b>. Токен — fine-grained, доступ к этому репозиторию: Contents (read/write) и Actions (read).</Note>
          </Card>
        </div>
      </div>
      <CompareDialog open={!!cmp} onClose={() => setCmp(null)} title={cmp?.title || ''} changes={cmp?.changes ?? null} onRestore={restore} />
    </div>
  );
}

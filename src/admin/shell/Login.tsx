'use client';
import { useState, type FormEvent } from 'react';
import { Butterfly, Mark } from '@/components/Brand';
import { defaultBranch, defaultRepo } from '../state/github';
import { loginGithub, loginLocal } from '../state/store';
import { I } from '../ui/icons';
import { Btn, Field, Note, Switch } from '../ui/kit';

const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new';

export function Login() {
  const [token, setToken] = useState('');
  const [show, setShow] = useState(false);
  const [repo, setRepo] = useState(defaultRepo());
  const [branch, setBranch] = useState(defaultBranch());
  const [remember, setRemember] = useState(true);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { setError('Вставьте токен доступа'); return; }
    setBusy(true);
    setError('');
    try { await loginGithub(token, repo, branch, remember); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="adm-login">
      <div className="adm-login__art">
        <div className="hero__grain" />
        <div className="adm-login__brand"><Mark className="" /><span>Korea Secret</span></div>
        <div className="adm-login__float"><Butterfly /></div>
        <h1 className="adm-login__claim">Вся витрина — <em>в одной</em> панели</h1>
        <div className="adm-login__points">
          <div><I name="box" />Товары, бренды, цены и остатки — с массовым редактированием и импортом из Excel</div>
          <div><I name="layout" />Главная страница как конструктор: блоки, баннеры, акции и тексты</div>
          <div><I name="chart" />Дашборды, аналитика продаж и отчёты в XLSX, CSV и PDF</div>
          <div><I name="cloud" />Публикация в один клик — сайт на GitHub Pages обновится сам</div>
        </div>
      </div>
      <div className="adm-login__main">
        <form className="adm-login__box" onSubmit={submit}>
          <div>
            <div className="a-badge a-badge--brand" style={{ marginBottom: 14 }}><I name="lock" />Панель управления</div>
            <h2 className="adm-login__title">Вход</h2>
            <p className="adm-ink2" style={{ marginTop: 8 }}>Сайт хранится в репозитории GitHub — панель публикует изменения прямо туда. Для входа нужен токен с правом записи в репозиторий.</p>
          </div>
          <ol className="adm-login__steps">
            <li><span>Откройте <a className="a-link" href={TOKEN_URL} target="_blank" rel="noopener noreferrer">создание токена на GitHub</a> (Fine-grained).</span></li>
            <li><span>Repository access → <b>Only select repositories</b> → <b>{repo}</b>.</span></li>
            <li><span>Permissions: <b>Contents — Read and write</b>, <b>Actions — Read-only</b>.</span></li>
            <li><span>Скопируйте токен и вставьте ниже.</span></li>
          </ol>
          <Field label="Токен GitHub" error={error || undefined}>
            <div className="a-affix">
              <input className="a-input a-input--lg adm-mono" type={show ? 'text' : 'password'} autoComplete="off" spellCheck={false} placeholder="github_pat_…" value={token} onChange={(e) => setToken(e.target.value)} autoFocus />
              <button type="button" className="a-icon-btn a-icon-btn--sm" style={{ position: 'absolute', right: 8 }} onClick={() => setShow((s) => !s)} aria-label={show ? 'Скрыть' : 'Показать'}><I name={show ? 'eye-off' : 'eye'} /></button>
            </div>
          </Field>
          {more ? (
            <div className="a-form-row a-form-row--2">
              <Field label="Репозиторий"><input className="a-input adm-mono" value={repo} onChange={(e) => setRepo(e.target.value)} /></Field>
              <Field label="Ветка"><input className="a-input adm-mono" value={branch} onChange={(e) => setBranch(e.target.value)} /></Field>
            </div>
          ) : (
            <button type="button" className="a-link" style={{ justifySelf: 'start', fontSize: 13 }} onClick={() => setMore(true)}>Репозиторий: {repo} · ветка {branch} — изменить</button>
          )}
          <Switch checked={remember} onChange={setRemember} label="Запомнить на этом устройстве" hint="Иначе вход сбросится при закрытии вкладки" />
          <Btn type="submit" variant="primary" size="lg" block loading={busy} icon="github">Войти через GitHub</Btn>
          <div className="adm-login__or">или</div>
          <Btn size="lg" block variant="outline" icon="eye" onClick={loginLocal}>Открыть в демо-режиме</Btn>
          <Note>В демо-режиме всё работает, но изменения хранятся только в этом браузере: их можно посмотреть на сайте в режиме предпросмотра и выгрузить файлом.</Note>
        </form>
      </div>
    </div>
  );
}

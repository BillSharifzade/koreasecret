'use client';
import { useState, type FormEvent } from 'react';
import { Butterfly, Mark } from '@/components/Brand';
import { defaultBranch, defaultRepo } from '../state/github';
import { loginGithub, loginLocal } from '../state/store';
import { loginWithPassword } from '../state/vault';
import { I } from '../ui/icons';
import { Btn, Field, Note, Switch } from '../ui/kit';
import { toast } from '../ui/overlay';

const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new';

/** Sign in with a GitHub token directly (for developers; the shop signs in with login and password). */
function TokenLogin() {
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState(defaultRepo());
  const [branch, setBranch] = useState(defaultBranch());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { setError('Вставьте токен доступа'); return; }
    setBusy(true);
    setError('');
    try { await loginGithub(token, repo, branch, true); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };
  return (
    <form className="a-stack a-stack--sm" onSubmit={submit}>
      <ol className="adm-login__steps">
        <li><span>Откройте <a className="a-link" href={TOKEN_URL} target="_blank" rel="noopener noreferrer">создание токена на GitHub</a> (Fine-grained).</span></li>
        <li><span>Repository access → <b>Only select repositories</b> → <b>{repo}</b>.</span></li>
        <li><span>Permissions: <b>Contents — Read and write</b>, <b>Actions — Read-only</b>.</span></li>
      </ol>
      <Field label="Токен GitHub" error={error || undefined}><input className="a-input adm-mono" type="password" autoComplete="off" spellCheck={false} placeholder="github_pat_…" value={token} onChange={(e) => setToken(e.target.value)} /></Field>
      <div className="a-form-row a-form-row--2">
        <Field label="Репозиторий"><input className="a-input adm-mono" value={repo} onChange={(e) => setRepo(e.target.value)} /></Field>
        <Field label="Ветка"><input className="a-input adm-mono" value={branch} onChange={(e) => setBranch(e.target.value)} /></Field>
      </div>
      <Btn type="submit" variant="dark" block loading={busy} icon="github">Войти с токеном</Btn>
    </form>
  );
}

export function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [other, setOther] = useState<'none' | 'token'>('none');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) { setError('Введите логин и пароль'); return; }
    setBusy(true);
    setError('');
    try {
      const mode = await loginWithPassword(login, password, remember);
      if (mode === 'local') toast({ title: 'Вход выполнен в демо-режиме', text: 'Публикация включится, когда в репозитории будет секрет ADMIN_GITHUB_TOKEN', ms: 7000 });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
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
        <div className="adm-login__box">
          <form className="a-stack" onSubmit={submit}>
            <div>
              <div className="a-badge a-badge--brand" style={{ marginBottom: 14 }}><I name="lock" />Панель управления</div>
              <h2 className="adm-login__title">Вход</h2>
              <p className="adm-ink2" style={{ marginTop: 8 }}>Введите логин и пароль администратора магазина.</p>
            </div>
            <Field label="Логин"><input className="a-input a-input--lg" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={login} onChange={(e) => setLogin(e.target.value)} autoFocus /></Field>
            <Field label="Пароль" error={error || undefined}>
              <div className="a-affix">
                <input className="a-input a-input--lg" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="a-icon-btn a-icon-btn--sm" style={{ position: 'absolute', right: 8 }} onClick={() => setShow((s) => !s)} aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}><I name={show ? 'eye-off' : 'eye'} /></button>
              </div>
            </Field>
            <Switch checked={remember} onChange={setRemember} label="Запомнить на этом устройстве" hint="Иначе вход сбросится при закрытии вкладки" />
            <Btn type="submit" variant="primary" size="lg" block loading={busy} icon="lock">{busy ? 'Проверяем…' : 'Войти'}</Btn>
          </form>
          <div className="adm-login__or">другие способы входа</div>
          {other === 'token' ? <TokenLogin /> : (
            <div className="a-stack a-stack--sm">
              <Btn block variant="outline" icon="eye" onClick={loginLocal}>Открыть в демо-режиме</Btn>
              <Btn block variant="ghost" icon="github" onClick={() => setOther('token')}>Войти с токеном GitHub</Btn>
            </div>
          )}
          <Note>В демо-режиме всё работает, но изменения хранятся только в этом браузере: их можно посмотреть на сайте в режиме предпросмотра и выгрузить файлом.</Note>
        </div>
      </div>
    </div>
  );
}

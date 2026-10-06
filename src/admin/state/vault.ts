'use client';
import { BASE_PATH } from '@/lib/site';
import vault from '../vault.json';
import { defaultBranch, defaultRepo } from './github';
import { loginGithub, loginLocal } from './store';

/* Login + password → the admin's GitHub token, without a server.
   vault.json holds an RSA private key encrypted with a key derived from the login and password (PBKDF2-SHA256);
   the build ships the GitHub token encrypted with the matching public key (admin-token.json). Wrong credentials
   fail the AES-GCM check; right ones decrypt the private key, which decrypts the token.
   Regenerate with scripts/admin-credentials.ts. */

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export class BadCredentials extends Error {}
export interface Unlocked { token: string | null; repo?: string; branch?: string }

async function privateKey(login: string, password: string) {
  const v = vault as { kdf: { iterations: number; salt: string }; key: { iv: string; data: string } };
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(`${login.trim().toLowerCase()}\n${password}`), 'PBKDF2', false, ['deriveKey']);
  const kek = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(v.kdf.salt), iterations: v.kdf.iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  let pkcs8: ArrayBuffer;
  try { pkcs8 = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(v.key.iv) }, kek, b64(v.key.data)); }
  catch { throw new BadCredentials('Неверный логин или пароль'); }
  return crypto.subtle.importKey('pkcs8', pkcs8, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
}

/** Checks the credentials and returns the GitHub token sealed into this build (null when none was configured). */
export async function unlock(login: string, password: string): Promise<Unlocked> {
  if (!crypto?.subtle) throw new Error('Вход по паролю работает только по https');
  const key = await privateKey(login, password);
  let sealed: { ct: string } | null = null;
  try {
    const res = await fetch(`${BASE_PATH}/admin-token.json`, { cache: 'no-store' });
    if (res.ok) sealed = await res.json();
  } catch { /* offline or missing: demo mode */ }
  if (!sealed?.ct) return { token: null };
  const plain = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, b64(sealed.ct));
  const data = JSON.parse(new TextDecoder().decode(plain)) as { token: string; repo?: string; branch?: string };
  return { token: data.token, repo: data.repo, branch: data.branch };
}

/** Sign in with the panel's login and password: GitHub mode when the build carries a token, demo mode otherwise. */
export async function loginWithPassword(login: string, password: string, remember: boolean): Promise<'github' | 'local'> {
  const u = await unlock(login, password);
  if (!u.token) { loginLocal(); return 'local'; }
  try {
    await loginGithub(u.token, u.repo || defaultRepo(), u.branch || defaultBranch(), remember);
  } catch (e) {
    throw new Error(`Пароль верный, но GitHub не принял сохранённый токен (${e instanceof Error ? e.message : String(e)}). Обновите секрет ADMIN_GITHUB_TOKEN в настройках репозитория.`);
  }
  return 'github';
}

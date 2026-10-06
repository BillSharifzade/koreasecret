/* Sets the admin panel's login and password.

     ADMIN_LOGIN=… ADMIN_PASSWORD=… bun scripts/admin-credentials.ts

   Writes src/admin/vault.json: a fresh RSA key pair whose private half is encrypted with a key derived from the
   login and password (PBKDF2-SHA256). Neither the password nor anything that reveals it without brute force is
   stored. At build time scripts/postbuild.ts encrypts the GitHub token (secret ADMIN_GITHUB_TOKEN) with the public
   half; only someone who knows the login and password can decrypt it in the browser. Commit vault.json afterwards. */
import { createCipheriv, generateKeyPairSync, pbkdf2Sync, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const login = (process.env.ADMIN_LOGIN || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
if (!login || password.length < 8) {
  console.error('Set ADMIN_LOGIN and ADMIN_PASSWORD (at least 8 characters).');
  process.exit(1);
}

const ITERATIONS = 600_000;
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'der' }
});
const salt = randomBytes(16);
const iv = randomBytes(12);
const kek = pbkdf2Sync(`${login}\n${password}`, salt, ITERATIONS, 32, 'sha256');
const cipher = createCipheriv('aes-256-gcm', kek, iv);
// WebCrypto expects AES-GCM output as ciphertext followed by the 16-byte tag
const wrapped = Buffer.concat([cipher.update(privateKey), cipher.final(), cipher.getAuthTag()]);

const vault = {
  v: 1,
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: salt.toString('base64') },
  key: { iv: iv.toString('base64'), data: wrapped.toString('base64') },
  publicKey: publicKey.toString('base64')
};
const file = join(import.meta.dir, '..', 'src', 'admin', 'vault.json');
writeFileSync(file, JSON.stringify(vault, null, 2) + '\n');
console.log(`admin-credentials: wrote ${file} for login "${login}" — commit it, and set the ADMIN_GITHUB_TOKEN secret to publish`);

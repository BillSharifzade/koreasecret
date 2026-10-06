/* Runs after `next build` (static export): adds GitHub Pages helpers to out/ and seals the admin's GitHub token. */
import { constants, publicEncrypt } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(import.meta.dir, '..', 'out');
if (!existsSync(out)) throw new Error('out/ not found — run `next build` first');

// serve files and folders that start with an underscore (_next/) as-is
writeFileSync(join(out, '.nojekyll'), '');
console.log('postbuild: wrote out/.nojekyll');

/* The admin signs in with a login and password (src/admin/vault.json); the GitHub token it publishes with comes
   from the ADMIN_GITHUB_TOKEN secret and is shipped only encrypted with the vault's public key. */
const token = (process.env.ADMIN_GITHUB_TOKEN || '').trim();
const vaultFile = join(import.meta.dir, '..', 'src', 'admin', 'vault.json');
if (token && existsSync(vaultFile)) {
  const vault = JSON.parse(readFileSync(vaultFile, 'utf8')) as { publicKey: string };
  const ct = publicEncrypt(
    { key: Buffer.from(vault.publicKey, 'base64'), format: 'der', type: 'spki', padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    Buffer.from(JSON.stringify({ token, repo: process.env.NEXT_PUBLIC_GITHUB_REPO || undefined, branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || undefined }))
  );
  writeFileSync(join(out, 'admin-token.json'), JSON.stringify({ v: 1, ct: ct.toString('base64') }));
  console.log('postbuild: sealed the admin GitHub token into out/admin-token.json');
} else {
  console.log('postbuild: no ADMIN_GITHUB_TOKEN — the admin login opens the panel in demo mode');
}

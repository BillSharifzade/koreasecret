/* Runs after `next build` (static export): adds GitHub Pages helpers to out/. */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(import.meta.dir, '..', 'out');
if (!existsSync(out)) throw new Error('out/ not found — run `next build` first');

// serve files and folders that start with an underscore (_next/) as-is
writeFileSync(join(out, '.nojekyll'), '');
console.log('postbuild: wrote out/.nojekyll');

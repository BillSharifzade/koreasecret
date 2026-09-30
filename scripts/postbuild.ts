/* Runs after `next build` (static export): adds the language-picking entry page and Pages helpers to out/. */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = join(import.meta.dir, '..', 'out');
if (!existsSync(out)) throw new Error('out/ not found — run `next build` first');

const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Korea Secret</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="1; url=./ru/">
<link rel="canonical" href="./ru/">
<script>
(function () {
  var l = 'ru';
  try {
    var saved = localStorage.getItem('ks-lang');
    if (saved === 'ru' || saved === 'en') l = saved;
  } catch (e) {}
  location.replace('./' + l + '/' + location.search + location.hash);
})();
</script>
<style>html,body{height:100%;margin:0;background:#dd4487}</style>
</head>
<body></body>
</html>
`;
writeFileSync(join(out, 'index.html'), index);
writeFileSync(join(out, '.nojekyll'), '');
console.log('postbuild: wrote out/index.html and out/.nojekyll');

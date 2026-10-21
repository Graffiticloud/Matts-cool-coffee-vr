/* Cache-busting: run `node ops/stamp.mjs` before every commit.
   Rewrites the import map in each models/<id>/index.html so every engine and model module is loaded as
   file.js?v=<hash of its contents>. Browsers then fetch changed files straight after an update instead of
   reusing their cached copy for up to 10 minutes (GitHub Pages' cache time). Unchanged files keep their hash. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hash = f => createHash('sha1').update(readFileSync(f)).digest('hex').slice(0, 8);
const THREE = {
  'three':'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js',
  'three/addons/':'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/'
};
const engine = readdirSync(join(root, 'engine')).filter(f => f.endsWith('.js'));
let n = 0;
for(const id of readdirSync(join(root, 'models'))){
  const page = join(root, 'models', id, 'index.html');
  if(!existsSync(page)) continue;
  const map = { ...THREE };
  for(const f of engine) map[`../../engine/${f}`] = `../../engine/${f}?v=${hash(join(root, 'engine', f))}`;
  for(const f of readdirSync(join(root, 'models', id)).filter(f => f.endsWith('.js'))) map[`./${f}`] = `./${f}?v=${hash(join(root, 'models', id, f))}`;
  const json = '{"imports":{\n' + Object.entries(map).map(([k, v]) => `  ${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n') + '\n}}';
  const html = readFileSync(page, 'utf8');
  const out = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, `<script type="importmap">\n${json}\n</script>`);
  if(out !== html){ writeFileSync(page, out); n++; }
}
console.log(`stamped ${n} page(s)`);

/* Moves answer keys out of the public specs.
   For each models/<id>/spec.js whose questions still carry answer/explain/ref:
     - applies any option rewrites in ops/keys/rewrites.json (optional, then delete it),
     - writes the keys to ops/keys/keys.local.json (git-ignored) for upload to the Sheet's Keys tab,
     - rewrites the questions block in spec.js to contain only id, hotspot, q and options.
   Usage: node ops/keys/split.mjs [model-id ...] */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const rwPath = join(root, 'ops/keys/rewrites.json'), keysPath = join(root, 'ops/keys/keys.local.json');
const rewrites = existsSync(rwPath) ? JSON.parse(readFileSync(rwPath, 'utf8')) : {};
const keys = existsSync(keysPath) ? JSON.parse(readFileSync(keysPath, 'utf8')) : {};
const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(join(root, 'models')).filter(id => existsSync(join(root, 'models', id, 'spec.js')));

for(const id of ids){
  const file = join(root, 'models', id, 'spec.js');
  const { spec } = await import(pathToFileURL(file).href + '?t=' + Date.now());
  if(!spec.questions.some(q => q.answer !== undefined)){ console.log(`${id}: already split`); continue; }
  keys[id] = keys[id] || {};
  const pub = spec.questions.map(q => {
    const options = rewrites[id]?.[q.id] || q.options;
    if(options.length !== q.options.length) throw new Error(`${id} ${q.id}: rewrite changes the number of options`);
    keys[id][q.id] = { answer:q.answer, explain:q.explain, ref:q.ref };
    return { id:q.id, hotspot:q.hotspot, q:q.q, options };
  });
  const src = readFileSync(file, 'utf8');
  const start = src.indexOf('\n  questions:[');
  const end = src.indexOf('\n  ],', start);
  if(start < 0 || end < 0) throw new Error(`${id}: could not find the questions block`);
  const block = '\n  /* Answers, explanations and references are not published: the Worker marks answers against the private key. */\n  questions:[\n'
    + pub.map(q => '    ' + JSON.stringify(q)).join(',\n') + '\n  ],';
  writeFileSync(file, src.slice(0, start) + block + src.slice(end + 5));
  console.log(`${id}: ${pub.length} questions split`);
}
writeFileSync(keysPath, JSON.stringify(keys, null, 1));
console.log('keys written to ops/keys/keys.local.json (do not commit)');

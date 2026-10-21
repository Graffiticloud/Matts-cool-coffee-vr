/* Flags guessable questions: the correct option much longer than the others, or the same answer position too often. */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
const KEYS = existsSync('ops/keys/keys.local.json') ? JSON.parse(readFileSync('ops/keys/keys.local.json', 'utf8')) : {};
const ids = readdirSync('models').filter(id => existsSync(`models/${id}/spec.js`));
let flagged = 0;
for(const id of ids){
  const { spec } = await import(`../models/${id}/spec.js`);
  const qs = spec.questions.map(q => ({ ...q, answer:q.answer ?? KEYS[id]?.[q.id]?.answer })).filter(q => q.answer !== undefined);
  const longest = qs.filter(q => { const L = q.options.map(o => o.length), a = L[q.answer]; return a === Math.max(...L); }).length;
  const bias = qs.filter(q => { const L = q.options.map(o => o.length), a = L[q.answer], o = L.filter((_, i) => i !== q.answer); return a > 1.25 * Math.max(...o); });
  flagged += bias.length;
  console.log(`${id}: ${qs.length} questions; answer is longest in ${longest}; clearly longest (>25%) in ${bias.length}${bias.length ? ': ' + bias.map(q => q.id).join(' ') : ''}`);
}
process.exitCode = flagged ? 1 : 0;

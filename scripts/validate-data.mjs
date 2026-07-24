// 用 JSON Schema 驗證 public/data/trip.json，改資料打錯會在 CI 被擋下
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';

const read = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf-8'));

const schema = read('../schema/trip.schema.json');
const data = read('../public/data/trip.json');

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

if (validate(data)) {
  console.log('✅ trip.json 通過 schema 驗證');
  process.exit(0);
}

console.error('❌ trip.json 驗證失敗：');
for (const err of validate.errors ?? []) {
  console.error(`  ${err.instancePath || '(root)'} ${err.message}`);
}
process.exit(1);

import { readFileSync } from 'fs'

const lines = readFileSync('scripts/monuments_dump.jsonl', 'utf-8').trim().split('\n')
const rows = lines.map(l => JSON.parse(l))

const fixedByUser = new Set(['14d67cf7-eb27-4036-b7ee-c7debc5edfc2', '7864c744-3c8a-413a-a49b-a63407ef4435', 'db933cfa-d11a-4aa8-9321-3727237f9934'])

const okKeywords = ['名号碑', '名号塔', '名号石', '念仏碑', '念仏塔', '念仏石', '供養塔']

let i = 1
for (const r of rows) {
  let status
  if (fixedByUser.has(r.id)) status = '済(本人修正)'
  else if (r.is_verified) status = '済(verified)'
  else if (okKeywords.some(k => r.name.includes(k))) status = 'OK想定'
  else status = '要確認'
  console.log(`${String(i).padStart(2,' ')}. [${status}] ${r.name} / ${r.prefecture} ${r.address}`)
  i++
}

const needCheck = rows.filter(r => !fixedByUser.has(r.id) && !r.is_verified && !okKeywords.some(k => r.name.includes(k)))
console.error(`\n要確認件数: ${needCheck.length} / 全${rows.length}件`)

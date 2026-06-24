import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(dir, '..', '.env.local')
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/)
  if (m) process.env[m[1].trim()] = m[2].trim()
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const { data, error } = await supabase
  .from('monuments')
  .select('id, name, prefecture, address, location, is_verified')
  .order('id')

if (error) {
  console.error(error)
  process.exit(1)
}

for (const row of data) {
  console.log(JSON.stringify(row))
}

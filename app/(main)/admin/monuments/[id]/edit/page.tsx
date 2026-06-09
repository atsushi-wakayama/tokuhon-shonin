import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditForm } from './EditForm'

function parseLocationCoords(location: unknown): { latitude: number | null; longitude: number | null } {
  if (!location) return { latitude: null, longitude: null }
  if (typeof location === 'object' && location !== null && Array.isArray((location as any).coordinates)) {
    const [lng, lat] = (location as any).coordinates
    return { latitude: lat, longitude: lng }
  }
  if (typeof location === 'string' && location.length > 10) {
    try {
      const bytes = new Uint8Array(location.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
      const view = new DataView(bytes.buffer)
      const le = bytes[0] === 1
      const wkbType = view.getUint32(1, le)
      const hasSrid = (wkbType & 0x20000000) !== 0
      const offset = 1 + 4 + (hasSrid ? 4 : 0)
      const x = view.getFloat64(offset, le)
      const y = view.getFloat64(offset + 8, le)
      if (!isFinite(x) || !isFinite(y)) return { latitude: null, longitude: null }
      return { latitude: y, longitude: x }
    } catch { return { latitude: null, longitude: null } }
  }
  return { latitude: null, longitude: null }
}

export default async function EditMonumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!(profile as any)?.is_admin) redirect('/admin')

  const [{ data: monument }, { data: areas }] = await Promise.all([
    supabase.from('monuments').select('*').eq('id', id).single(),
    supabase.from('areas').select('id, name').order('sort_order'),
  ])

  if (!monument) notFound()

  const coords = parseLocationCoords((monument as any).location)
  const monumentWithCoords = { ...monument, ...coords }

  return <EditForm monument={monumentWithCoords as any} areas={areas ?? []} />
}

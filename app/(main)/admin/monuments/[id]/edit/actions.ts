'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('未ログインです')
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!(profile as any)?.is_admin) throw new Error('管理者権限がありません')
  return supabase
}

export async function updateMonument(_prevState: { error: string } | null, formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await getAdminClient()

  const areaIdRaw = formData.get('area_id') as string
  const lat = parseFloat(formData.get('latitude') as string)
  const lng = parseFloat(formData.get('longitude') as string)
  const updates: Record<string, unknown> = {
    name: formData.get('name') as string,
    prefecture: formData.get('prefecture') as string,
    address: (formData.get('address') as string) || null,
    description: (formData.get('description') as string) || null,
    access_info: (formData.get('access_info') as string) || null,
    area_id: areaIdRaw ? parseInt(areaIdRaw) : null,
    is_verified: formData.get('is_verified') === 'true',
  }
  if (!isNaN(lat) && !isNaN(lng)) {
    updates.location = `SRID=4326;POINT(${lng} ${lat})`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = supabase
  const { error } = await db.from('monuments').update(updates).eq('id', id)
  if (error) return { error: '保存に失敗しました。もう一度お試しください' }

  revalidatePath('/admin')
  redirect('/admin')
}

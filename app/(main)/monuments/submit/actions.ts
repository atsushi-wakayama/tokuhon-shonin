'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitMonument(
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '未ログインです' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'スポット名を入力してください' }

  const lat = parseFloat(formData.get('latitude') as string)
  const lng = parseFloat(formData.get('longitude') as string)
  if (isNaN(lat) || isNaN(lng)) return { error: '場所を指定してください' }

  const photoUrl = (formData.get('photo_url') as string) || null
  const memo = (formData.get('memo') as string)?.trim() || null
  const adminInfo = (formData.get('admin_info') as string)?.trim() || null

  let adminInfoProvidedBy: string | null = null
  if (adminInfo) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()
    adminInfoProvidedBy = profile?.nickname ?? null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('monuments')
    .insert({
      name,
      location: `SRID=4326;POINT(${lng} ${lat})`,
      prefecture: '',
      address: null,
      area_id: null,
      description: null,
      access_info: null,
      image_urls: photoUrl ? [photoUrl] : [],
      status: 'pending',
      submitted_by: user.id,
      is_verified: false,
      admin_info: adminInfo,
      admin_info_provided_by: adminInfoProvidedBy,
      admin_info_provided_at: adminInfo ? new Date().toISOString() : null,
      submission_memo: memo,
    })

  if (error) {
    console.error('[submitMonument] INSERT error:', JSON.stringify(error))
    return { error: '申請に失敗しました。もう一度お試しください' }
  }

  return null
}

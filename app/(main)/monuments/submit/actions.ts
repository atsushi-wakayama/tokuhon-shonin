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

  const prefecture = (formData.get('prefecture') as string) || ''
  const address = (formData.get('address') as string) || null
  const areaIdRaw = formData.get('area_id') as string
  const description = (formData.get('description') as string) || null
  const accessInfo = (formData.get('access_info') as string) || null
  const photoFile = formData.get('photo') as File | null

  let imageUrls: string[] = []

  if (photoFile && photoFile.size > 0) {
    const ext = photoFile.name.split('.').pop() || 'jpg'
    const path = `stamps/${user.id}/submission_${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('user-photos')
      .upload(path, photoFile, { upsert: false })

    if (uploadError) return { error: '写真のアップロードに失敗しました' }

    const { data: urlData } = supabase.storage
      .from('user-photos')
      .getPublicUrl(path)
    imageUrls = [urlData.publicUrl]
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('monuments').insert({
    name,
    location: `SRID=4326;POINT(${lng} ${lat})`,
    prefecture,
    address,
    area_id: areaIdRaw ? parseInt(areaIdRaw) : null,
    description,
    access_info: accessInfo,
    image_urls: imageUrls,
    status: 'pending',
    submitted_by: user.id,
    is_verified: false,
  })

  if (error) {
    console.error('[submitMonument] INSERT error:', JSON.stringify(error))
    return { error: '申請に失敗しました。もう一度お試しください' }
  }

  return null
}

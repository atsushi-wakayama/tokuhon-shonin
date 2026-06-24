'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { parseLocationCoords } from '@/lib/utils/location'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('未ログインです')
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!(profile as any)?.is_admin) throw new Error('管理者権限がありません')
}

export async function approveMonument(formData: FormData) {
  await checkAdmin()
  const id = formData.get('id') as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: monument } = await supabase
    .from('monuments')
    .select('submitted_by, image_urls, location, submission_memo')
    .eq('id', id)
    .single()

  await supabase.from('monuments').update({ status: 'approved' }).eq('id', id)

  if (monument?.submitted_by) {
    const photoUrl = monument.image_urls?.[0] ?? null
    if (photoUrl) {
      const { latitude, longitude } = parseLocationCoords(monument.location)
      await supabase.from('stamps').insert({
        user_id: monument.submitted_by,
        monument_id: id,
        photo_url: photoUrl,
        latitude,
        longitude,
        memo: monument.submission_memo ?? null,
      })
    }
    await supabase.from('monuments').update({ image_urls: [], submission_memo: null }).eq('id', id)
  }

  revalidatePath('/admin')
}

export async function rejectMonument(formData: FormData) {
  await checkAdmin()
  const id = formData.get('id') as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  await supabase.from('monuments').update({ status: 'rejected' }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteMonument(formData: FormData): Promise<{ error: string } | null> {
  try {
    await checkAdmin()
  } catch (e: any) {
    console.error('[deleteMonument] checkAdmin failed:', e.message)
    return { error: `管理者チェック失敗: ${e.message}` }
  }
  const id = formData.get('id') as string
  console.log('[deleteMonument] deleting id:', id)
  if (!id) return { error: 'IDが空です' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const { error, count } = await supabase.from('monuments').delete().eq('id', id).select()
  if (error) {
    console.error('[deleteMonument] DB error:', JSON.stringify(error))
    return { error: `DB削除失敗: ${error.message}` }
  }
  console.log('[deleteMonument] deleted count:', count)
  revalidatePath('/admin')
  return null
}

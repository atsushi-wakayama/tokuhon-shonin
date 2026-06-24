'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStampMemo(formData: FormData): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未ログインです' }

  const id = formData.get('id') as string
  const memo = (formData.get('memo') as string)?.trim() || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('stamps')
    .update({ memo })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[updateStampMemo] UPDATE error:', JSON.stringify(error))
    return { error: 'メモの保存に失敗しました' }
  }

  revalidatePath(`/mypage/stamps/${id}`)
  return null
}

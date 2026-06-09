'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

export async function createMonument(_prevState: { error: string } | null, formData: FormData) {
  try {
    await checkAdmin()
  } catch (e: any) {
    return { error: `管理者チェック失敗: ${e.message}` }
  }

  const areaIdRaw = formData.get('area_id') as string
  const newMonument = {
    name: formData.get('name') as string,
    prefecture: formData.get('prefecture') as string,
    address: (formData.get('address') as string) || null,
    description: (formData.get('description') as string) || null,
    access_info: (formData.get('access_info') as string) || null,
    area_id: areaIdRaw ? parseInt(areaIdRaw) : null,
    is_verified: formData.get('is_verified') === 'true',
    status: 'approved',
  }

  const db = createAdminClient() as any
  const { error } = await db.from('monuments').insert(newMonument)
  if (error) return { error: '保存に失敗しました。もう一度お試しください' }

  revalidatePath('/admin')
  redirect('/admin')
}

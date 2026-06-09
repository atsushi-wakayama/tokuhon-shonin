import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateForm } from './CreateForm'

export default async function NewMonumentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!(profile as any)?.is_admin) redirect('/admin')

  const { data: areas } = await supabase.from('areas').select('id, name').order('sort_order')

  return <CreateForm areas={areas ?? []} />
}

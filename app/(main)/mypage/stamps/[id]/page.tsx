import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StampDetailClient } from './StampDetailClient'
import type { StampWithMonument } from '@/lib/types/database.types'

export default async function StampDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: stamp } = await supabase
    .from('stamps')
    .select('*, monument:monuments(*)')
    .eq('id', id)
    .single()

  if (!stamp || (stamp as any).user_id !== user.id) notFound()

  return <StampDetailClient stamp={stamp as unknown as StampWithMonument} />
}

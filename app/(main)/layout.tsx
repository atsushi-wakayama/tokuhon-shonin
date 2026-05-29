import { BottomNav } from '@/components/layout/BottomNav'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let avatarUrl: string | null = null
  let initial = ''

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url, nickname')
      .eq('id', user.id)
      .single()
    avatarUrl = (profile as any)?.avatar_url ?? null
    initial = (profile as any)?.nickname?.[0] ?? user.email?.[0]?.toUpperCase() ?? '人'
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      {children}
      <BottomNav avatarUrl={avatarUrl} initial={initial} />
    </div>
  )
}

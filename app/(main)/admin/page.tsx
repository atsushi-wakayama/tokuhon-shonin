import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminClient } from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!(profile as any)?.is_admin) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: '#f5f0eb' }}
      >
        <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm">
          <p className="mb-6 text-lg font-medium" style={{ color: '#3a2a1a' }}>
            このページにはアクセス権限がありません
          </p>
          <Link
            href="/map"
            className="inline-block rounded-xl px-8 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: '#b35c44' }}
          >
            OK
          </Link>
        </div>
      </div>
    )
  }

  const [
    { data: allMonuments, error: monumentsError },
    { data: pendingMonuments, error: pendingError },
  ] = await Promise.all([
    supabase
      .from('monuments')
      .select('id, name, prefecture, address, area_id, description, access_info, image_urls, is_verified, status, submitted_by')
      .neq('status', 'rejected')
      .order('name'),
    supabase
      .from('monuments')
      .select('id, name, prefecture, address, description, submitted_by, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  return (
    <AdminClient
      allMonuments={(allMonuments as any) ?? []}
      pendingMonuments={(pendingMonuments as any) ?? []}
      monumentsError={!!monumentsError}
      pendingError={!!pendingError}
    />
  )
}

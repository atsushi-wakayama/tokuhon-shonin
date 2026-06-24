import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubmitForm } from './SubmitForm'

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { from } = await searchParams
  const backPath = from === 'map' ? '/map' : '/monuments'

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#f5f0eb' }}
    >
      <div className="mx-auto max-w-md pb-24">
        <SubmitForm backPath={backPath} />
      </div>
    </div>
  )
}

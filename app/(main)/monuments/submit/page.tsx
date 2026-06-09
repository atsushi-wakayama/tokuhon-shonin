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
      style={{
        backgroundImage: 'url(/bg-pattern.png)',
        backgroundSize: '320px',
        backgroundRepeat: 'repeat',
        backgroundColor: '#f5f0eb',
      }}
    >
      <div className="mx-auto max-w-md px-4 pt-6 pb-24">
        <h1
          className="mb-6 inline-block rounded-xl px-4 py-2 text-xl"
          style={{ color: '#423629', backgroundColor: 'rgba(255,255,255,0.8)' }}
        >
          新しいスポットを申請
        </h1>
        <SubmitForm backPath={backPath} />
      </div>
    </div>
  )
}

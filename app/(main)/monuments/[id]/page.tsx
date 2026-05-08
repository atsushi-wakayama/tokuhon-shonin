import { notFound } from 'next/navigation'
import { MapPin, Navigation, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CheckInButton } from './CheckInButton'
import { MOCK_MONUMENTS } from '@/lib/mock/monuments'
import { createClient } from '@/lib/supabase/server'

export default async function MonumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const monument = MOCK_MONUMENTS.find((m) => m.id === id)
  if (!monument) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // スタンプ取得済みか確認
  let isStamped = false
  if (user) {
    const { data } = await supabase
      .from('stamps')
      .select('id')
      .eq('user_id', user.id)
      .eq('monument_id', id)
      .single()
    isStamped = !!data
  }

  return (
    <div className="mx-auto max-w-md">
      {/* ヘッダー */}
      <div className="relative flex h-48 w-full items-center justify-center bg-gradient-to-b from-amber-900 to-stone-800">
        <p className="text-5xl font-bold tracking-[0.5em] text-amber-100">南無</p>
        <Link
          href="/monuments"
          className="absolute left-4 top-4 rounded-full bg-white/90 p-2 shadow"
        >
          <ArrowLeft size={20} className="text-stone-700" />
        </Link>
        {isStamped && (
          <div className="absolute right-4 top-4 rounded-full bg-amber-700 px-3 py-1 text-xs font-bold text-white shadow">
            スタンプ済み
          </div>
        )}
      </div>

      <div className="px-4 py-5">
        <h1 className="text-xl font-bold text-stone-800">{monument.name}</h1>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
            <MapPin size={12} /> {monument.prefecture}
          </span>
          {monument.area && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
              {monument.area.name}
            </span>
          )}
        </div>

        {monument.address && (
          <p className="mt-3 text-sm text-stone-500">{monument.address}</p>
        )}

        {monument.description && (
          <div className="mt-5">
            <h2 className="mb-2 font-semibold text-stone-700">解説</h2>
            <p className="text-sm leading-relaxed text-stone-600">{monument.description}</p>
          </div>
        )}

        {monument.access_info && (
          <div className="mt-5">
            <h2 className="mb-2 flex items-center gap-1 font-semibold text-stone-700">
              <Navigation size={14} /> アクセス
            </h2>
            <p className="text-sm text-stone-600">{monument.access_info}</p>
          </div>
        )}

        <div className="mt-8">
          <CheckInButton
            monument={monument as any}
            userId={user?.id ?? null}
            isStamped={isStamped}
          />
        </div>
      </div>
    </div>
  )
}

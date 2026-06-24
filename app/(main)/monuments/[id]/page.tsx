import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Navigation, BookOpen, Users } from 'lucide-react'
import { CheckInButton } from './CheckInButton'
import { BackButton } from '@/components/layout/BackButton'
import { createClient } from '@/lib/supabase/server'
import type { MonumentWithArea } from '@/lib/types/database.types'

export default async function MonumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: monument } = await supabase
    .from('monuments')
    .select('*, area:areas(*)')
    .eq('id', id)
    .single()

  if (!monument) notFound()

  const m = monument as MonumentWithArea

  const [{ count: prevCount }, { data: { user } }, { data: stampCountRow }] = await Promise.all([
    supabase.from('monuments').select('id', { count: 'exact', head: true }).lt('name', m.name),
    supabase.auth.getUser(),
    supabase.from('monument_stamp_counts').select('stamp_count').eq('monument_id', id).maybeSingle(),
  ])

  const monumentNo = String((prevCount ?? 0) + 1).padStart(2, '0')
  const stampCount = (stampCountRow as any)?.stamp_count ?? 0

  let isStamped = false
  if (user) {
    const { data } = await supabase.from('stamps').select('id').eq('user_id', user.id).eq('monument_id', id).single()
    isStamped = !!data
  }

  const washibg = [
    'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
    'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  ].join(', ')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0eb' }}>
      <div className="mx-auto max-w-md">

        {/* ヘッダー：和紙テクスチャ */}
        <div className="relative px-4 pb-5 pt-4" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>

          {/* 戻るボタン */}
          <BackButton fallbackHref="/monuments" />

          {/* 朱印スタンプ */}
          <div className="absolute right-0 top-0 z-10" style={{ transform: 'rotate(8deg)' }}>
            <Image src="/tokuhoninkan.png" alt="徳本上人霊場" width={140} height={140} />
          </div>

          {/* タイトル行 */}
          <div className="mt-3 flex items-baseline gap-3">
            <span className="flex-shrink-0 rounded px-2 py-0.5 text-sm font-medium tracking-wide"
              style={{ backgroundColor: '#C0392B', color: '#fff' }}>
              No.{monumentNo}
            </span>
            <h1 className="text-2xl leading-snug" style={{ color: '#4a3a2a' }}>{m.name}</h1>
          </div>

          <p className="mt-1.5 flex items-center justify-end gap-1 text-sm font-medium" style={{ color: '#8B4513' }}>
            <Users size={13} />
            {stampCount}人がチェックイン済
          </p>
        </div>

        {/* ボディ */}
        <div className="px-4 pb-10 pt-4">
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.92)', border: '1px solid #e8ddd0' }}>

            {/* 所在地 */}
            {m.address && (
              <div className="flex gap-3 px-4 py-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: '#f5ede4' }}>
                  <MapPin size={15} style={{ color: '#8B4513' }} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: '#8B4513' }}>所在地</p>
                  <p className="text-base leading-relaxed" style={{ color: '#4a3a2a' }}>{m.address}</p>
                </div>
              </div>
            )}

            {/* 解説 */}
            {m.description && (
              <>
                <div style={{ height: '1px', backgroundColor: '#e8ddd0', margin: '0 1rem' }} />
                <div className="flex gap-3 px-4 py-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: '#f5ede4' }}>
                    <BookOpen size={15} style={{ color: '#8B4513' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: '#8B4513' }}>解説</p>
                    <p className="text-base leading-relaxed" style={{ color: '#4a3a2a' }}>{m.description}</p>
                  </div>
                </div>
              </>
            )}

            {/* アクセス */}
            {m.access_info && (
              <>
                <div style={{ height: '1px', backgroundColor: '#e8ddd0', margin: '0 1rem' }} />
                <div className="flex gap-3 px-4 py-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: '#f5ede4' }}>
                    <Navigation size={15} style={{ color: '#8B4513' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-0.5" style={{ color: '#8B4513' }}>アクセス</p>
                    <p className="text-base leading-relaxed" style={{ color: '#4a3a2a' }}>{m.access_info}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            <CheckInButton monument={m as any} userId={user?.id ?? null} isStamped={isStamped} />
          </div>
        </div>

      </div>
    </div>
  )
}

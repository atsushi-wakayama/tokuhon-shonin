import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

const BADGE_ICONS: ReactNode[] = [1, 2, 3, 4, 5, 6, 7].map((n) => (
  <Image key={n} src={`/icons/icon_0${n}.png`} alt={`称号${n}`} width={88} height={88} className="object-contain" />
))

const washibg = [
  'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
].join(', ')

export default async function BadgesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: allBadges }, { data: userBadgesRaw }] = await Promise.all([
    supabase.from('badges').select('*').order('sort_order'),
    user
      ? supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id)
      : Promise.resolve({ data: [] as { badge_id: number; earned_at: string }[] }),
  ])

  const earnedMap = new Map((userBadgesRaw ?? []).map((b: any) => [b.badge_id, b.earned_at]))
  const badges = (allBadges ?? []) as any[]
  const earnedCount = badges.filter((b) => earnedMap.has(b.id)).length

  const progressRadius = 26
  const progressCircumference = 2 * Math.PI * progressRadius
  const progressRatio = badges.length ? earnedCount / badges.length : 0
  const progressOffset = progressCircumference * (1 - progressRatio)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0eb' }}>
      <div className="mx-auto max-w-md pb-16">

        {/* ヘッダー：和紙テクスチャ */}
        <div className="relative px-4 pb-5 pt-4" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>
          <Link href="/mypage" className="inline-flex items-center justify-center rounded-full p-2 shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #d4c5b0' }}>
            <ArrowLeft size={18} style={{ color: '#4a3a2a' }} />
          </Link>

          {/* 獲得数ドーナツ */}
          <div className="absolute right-4 top-4 flex flex-shrink-0 flex-col items-center gap-0.5">
            <p className="text-xs font-medium" style={{ color: '#423629' }}>獲得した称号</p>
            <div className="relative" style={{ width: 84, height: 84 }}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r={progressRadius} fill="none" stroke="#e8ddd0" strokeWidth="8" />
                <circle cx="42" cy="42" r={progressRadius} fill="none" stroke="#C0392B" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={progressCircumference}
                  strokeDashoffset={progressOffset} transform="rotate(-90 42 42)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold leading-none" style={{ color: '#C0392B' }}>{earnedCount}</span>
                <span className="text-sm leading-none" style={{ color: '#8B4513' }}>／{badges.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <h1 className="text-2xl font-medium leading-snug" style={{ color: '#4a3a2a' }}>称号一覧</h1>
          </div>
        </div>

        <div className="px-4 pt-6">

        {/* 出発 */}
        <div className="mb-1 flex justify-center">
          <span className="rounded-full px-5 py-1.5 text-sm tracking-widest"
            style={{ color: '#C0392B', border: '1px dashed #C0392B', backgroundColor: 'rgba(255,255,255,0.7)' }}>
            巡礼の旅　出発
          </span>
        </div>


        {/* バッジ一覧 */}
        <div>
          {badges.map((badge: any, index: number) => {
            const isLeft = index % 2 === 0
            const earned = earnedMap.has(badge.id)
            const earnedAt = earnedMap.get(badge.id)
            const isLast = index === badges.length - 1
            const icon = BADGE_ICONS[index] ?? <Star size={22} />

            return (
              <div key={badge.id}>

                {/* バッジ行 */}
                <div className={`flex items-center gap-2 ${isLeft ? '' : 'flex-row-reverse'}`}>

                  {/* アイコン（88px） */}
                  <div className={`relative flex-shrink-0 ${!earned ? 'opacity-40 grayscale' : ''}`}>
                    <div className="flex h-[88px] w-[88px] items-center justify-center">
                      {icon}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: earned ? '#8B4513' : '#c0b0a0' }}>
                      {index + 1}
                    </span>
                  </div>

                  {/* テキストカード */}
                  <div className={`flex-1 min-w-0 rounded-2xl px-3 py-2.5 ${!earned ? 'opacity-55' : ''}`}
                    style={{
                      backgroundColor: earned ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${earned ? '#e8c5b0' : '#e0d8d0'}`,
                    }}>
                    <p className="text-xs mb-0.5" style={{ color: '#8B4513' }}>第{index + 1}番</p>
                    <p className="text-sm font-medium leading-snug" style={{ color: '#423629' }}>{badge.name}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#5a5a5a' }}>{badge.description}</p>
                    {earned && earnedAt && (
                      <p className="text-xs mt-1.5" style={{ color: '#C0392B' }}>
                        授与 {new Date(earnedAt).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                </div>

                {/* SVGコネクター：左アイコン中心(x=44)↔右アイコン中心(x=356) */}
                {!isLast && (
                  <svg viewBox="0 0 400 56" width="100%" height="56"
                    preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d={isLeft ? 'M 44 0 C 44 56 356 0 356 56' : 'M 356 0 C 356 56 44 0 44 56'}
                      stroke="#C0392B"
                      strokeWidth="2.5"
                      strokeDasharray="7 5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.55"
                    />
                  </svg>
                )}
              </div>
            )
          })}
        </div>

        {/* 満願 */}
        {badges.length > 0 && (
          <div className="mt-5 flex justify-center">
            <span className="rounded-full px-5 py-1.5 text-sm tracking-widest"
              style={{
                color: earnedCount === badges.length ? '#C0392B' : '#b0a090',
                border: `1px dashed ${earnedCount === badges.length ? '#C0392B' : '#c0b0a0'}`,
                backgroundColor: 'rgba(255,255,255,0.7)',
              }}>
              満願
            </span>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

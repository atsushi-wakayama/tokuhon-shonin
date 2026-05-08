import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'

export default async function BadgesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: allBadges }, { data: userBadgesRaw }] = await Promise.all([
    supabase.from('badges').select('*').order('sort_order'),
    user
      ? supabase.from('user_badges').select('badge_id').eq('user_id', user.id)
      : Promise.resolve({ data: [] }),
  ])

  const earnedIds = new Set((userBadgesRaw ?? []).map((b: any) => b.badge_id))
  const earnedCount = earnedIds.size
  const totalCount = allBadges?.length ?? 0

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/mypage" className="rounded-full p-1 text-stone-500 hover:bg-stone-100">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-stone-800">称号一覧</h1>
      </div>

      <p className="mb-5 text-sm text-stone-500">
        {earnedCount} / {totalCount} 獲得
      </p>

      <div className="space-y-3">
        {(allBadges ?? []).map((badge: any) => {
          const earned = earnedIds.has(badge.id)
          return (
            <div
              key={badge.id}
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                earned
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-stone-200 bg-white opacity-50'
              }`}
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${earned ? 'bg-amber-700' : 'bg-stone-200'}`}>
                <Trophy size={22} className={earned ? 'text-white' : 'text-stone-400'} />
              </div>
              <div>
                <p className="font-medium text-stone-800">{badge.name}</p>
                <p className="text-xs text-stone-500">{badge.description}</p>
              </div>
              {earned && (
                <span className="ml-auto flex-shrink-0 rounded-full bg-amber-700 px-2 py-0.5 text-xs font-bold text-white">
                  獲得済
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

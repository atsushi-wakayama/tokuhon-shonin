import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { StampGrid } from '@/components/stamp/StampGrid'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 未ログイン時
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 pt-6">
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-amber-700 p-5 text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-3xl">人</div>
          <div>
            <p className="text-lg font-bold">巡礼者</p>
            <p className="text-sm text-amber-200">スタンプ獲得数: <span className="font-bold text-white">0基</span></p>
          </div>
        </div>
        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-center">
          <p className="mb-3 text-sm text-stone-600">ログインするとスタンプが記録されます</p>
          <Link href="/login" className="inline-block rounded-xl bg-amber-700 px-6 py-2.5 text-sm font-bold text-white">
            ログイン / 新規登録
          </Link>
        </div>
      </div>
    )
  }

  // ログイン済み
  const [{ data: profileRaw }, { data: stamps }, { data: userBadgesRaw }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('stamps').select('*, monument:monuments(*)').eq('user_id', user.id).order('checked_in_at', { ascending: false }),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
  ])
  const profile = profileRaw as any

  const badgeIds = (userBadgesRaw ?? []).map((ub: any) => ub.badge_id)
  const { data: badgesData } = badgeIds.length > 0
    ? await supabase.from('badges').select('*').in('id', badgeIds)
    : { data: [] }
  const userBadges = badgesData ?? []

  const stampCount = stamps?.length ?? 0

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      {/* プロフィールヘッダー */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl bg-amber-700 p-5 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-3xl">
          {profile?.nickname?.[0] ?? user.email?.[0]?.toUpperCase() ?? '人'}
        </div>
        <div>
          <p className="text-lg font-bold">{profile?.nickname ?? user.email}</p>
          <p className="text-sm text-amber-200">
            スタンプ獲得数: <span className="font-bold text-white">{stampCount}基</span>
          </p>
        </div>
      </div>

      {/* 称号エリア */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1 font-bold text-stone-700">
            <Trophy size={16} className="text-amber-600" /> 称号
          </h2>
          <Link href="/mypage/badges" className="text-xs text-amber-700">すべて見る</Link>
        </div>
        {userBadges.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {userBadges.map((badge: any) => (
              <div key={badge.id} className="flex-shrink-0 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-center">
                <p className="text-xs font-medium text-amber-800">{badge.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-6 text-center text-sm text-stone-400">
            スタンプを集めると称号が解放されます
          </div>
        )}
      </div>

      {/* スタンプ帳 */}
      <h2 className="mb-3 font-bold text-stone-700">スタンプ帳</h2>
      <StampGrid stamps={(stamps as any) ?? []} />
    </div>
  )
}

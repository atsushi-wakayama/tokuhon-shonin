import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { StampGrid } from '@/components/stamp/StampGrid'
import { LogoutButton } from '@/components/layout/LogoutButton'
import { AvatarUpload } from '@/components/mypage/AvatarUpload'

const washibg = [
  'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
].join(', ')

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: '320px', backgroundRepeat: 'repeat', backgroundColor: '#f5f0eb' }}>
        <div className="mx-auto max-w-md px-4 pt-6">
          <div className="mb-6 rounded-2xl p-5" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold flex-shrink-0"
                style={{ backgroundColor: '#fdf0e8', border: '2px solid #8B4513', color: '#8B4513' }}>人</div>
              <div>
                <p className="text-xl font-medium" style={{ color: '#3a2a1a' }}>巡礼者</p>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl p-4 text-center" style={{ backgroundColor: '#fdf0e8' }}>
            <p className="mb-3 text-sm" style={{ color: '#5a5a5a' }}>ログインするとスタンプが記録されます</p>
            <Link href="/login" className="inline-block rounded-xl px-6 py-2.5 text-sm text-white" style={{ backgroundColor: '#b35c44' }}>
              ログイン / 新規登録
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const [{ data: profileRaw }, { data: stamps }, { data: userBadgesRaw }, { count: totalMonuments }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('stamps').select('*, monument:monuments(*)').eq('user_id', user.id).order('checked_in_at', { ascending: false }),
    supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
    supabase.from('monuments').select('id', { count: 'exact', head: true }),
  ])
  const profile = profileRaw as any

  const badgeIds = (userBadgesRaw ?? []).map((ub: any) => ub.badge_id)
  // 全バッジを sort_order 順で取得し、連番インデックスをアイコン番号として使う
  const { data: allBadgesOrdered } = await supabase.from('badges').select('*').order('sort_order')
  const badgeIconIndexMap = new Map((allBadgesOrdered ?? []).map((b: any, i: number) => [b.id, i + 1]))
  const userBadges = (allBadgesOrdered ?? []).filter((b: any) => badgeIds.includes(b.id))
  const stampCount = stamps?.length ?? 0
  const badgeCount = userBadges.length
  const rate = totalMonuments ? Math.round((stampCount / totalMonuments) * 100) : 0

  const initial = profile?.nickname?.[0] ?? user.email?.[0]?.toUpperCase() ?? '人'
  const displayName = profile?.nickname ?? user.email ?? ''

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: '320px', backgroundRepeat: 'repeat', backgroundColor: '#f5f0eb' }}>
      <div className="mx-auto max-w-md">

        {/* 和紙テクスチャヘッダー */}
        <div style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>

          {/* 上段：アバター・名前・ログアウト */}
          <div className="flex items-center gap-3 px-4 pt-5 pb-3">
            <AvatarUpload userId={user.id} avatarUrl={profile?.avatar_url ?? null} initial={initial} />
            <div className="flex-1 min-w-0">
              <p className="text-xl font-medium truncate" style={{ color: '#3a2a1a' }}>{displayName}</p>
            </div>
            <LogoutButton />
          </div>

          {/* 下段：スタッツカード3枚 */}
          <div className="flex gap-2 px-4 pb-5">
            {/* スタンプ獲得数（アクセントカード） */}
            <div className="flex-1 rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e8ddd0' }}>
              <p className="text-2xl font-bold" style={{ color: '#3a2a1a' }}>{stampCount}</p>
              <p className="mt-0.5 text-[10px]" style={{ color: '#9a8a7a' }}>スタンプ</p>
            </div>
            {/* 称号獲得数 */}
            <div className="flex-1 rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e8ddd0' }}>
              <p className="text-2xl font-bold" style={{ color: '#3a2a1a' }}>{badgeCount}</p>
              <p className="mt-0.5 text-[10px]" style={{ color: '#9a8a7a' }}>称号</p>
            </div>
            {/* 達成率 */}
            <div className="flex-1 rounded-xl p-3 text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e8ddd0' }}>
              <p className="text-2xl font-bold" style={{ color: '#3a2a1a' }}>{rate}%</p>
              <p className="mt-0.5 text-[10px]" style={{ color: '#9a8a7a' }}>達成率</p>
            </div>
          </div>
        </div>

        {/* ボディ */}
        <div className="px-4 pt-5">
          {/* 称号 */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-lg" style={{ color: '#423629', backgroundColor: 'rgba(255,255,255,0.8)' }}>
                <Trophy size={20} style={{ color: '#b35c44' }} /> 称号
              </h2>
              <Link href="/mypage/badges" className="rounded-xl px-3 py-1.5 text-sm"
                style={{ color: '#b35c44', backgroundColor: 'rgba(255,255,255,0.8)' }}>すべて見る</Link>
            </div>
            {userBadges.length > 0 ? (
              <div className="flex flex-col gap-2">
                {userBadges.map((badge: any) => (
                  <div key={badge.id} className="flex items-center gap-3 rounded-xl border px-4 py-3 w-full" style={{ borderColor: '#e8ddd0', backgroundColor: 'rgba(255,255,255,0.9)' }}>
                    <Image src={`/icons/icon_0${badgeIconIndexMap.get(badge.id)}.png`} alt={badge.name} width={72} height={72} className="object-contain flex-shrink-0" />
                    <p className="text-xl font-medium" style={{ color: '#423629' }}>{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 py-6 text-center text-sm" style={{ color: '#5a5a5a' }}>
                スタンプを集めると称号が解放されます
              </div>
            )}
          </div>

          {/* スタンプ帳 */}
          <h2 className="mb-3 inline-block rounded-xl px-3 py-1.5 text-lg" style={{ color: '#423629', backgroundColor: 'rgba(255,255,255,0.8)' }}>スタンプ帳</h2>
          <StampGrid stamps={(stamps as any) ?? []} />

          <div className="pb-8" />
        </div>
      </div>
    </div>
  )
}

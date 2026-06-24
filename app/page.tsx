import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/map')
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: '#f5f0eb' }}>
      {/* 写真ヒーロー部分（写真＋雲＋タイトルを1枚に合成した画像） */}
      <div className="relative w-full aspect-[3/4]">
        <Image
          src="/tokuhontoppicture.webp"
          alt="徳本上人 名号碑めぐり"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* 説明文・ボタン */}
      <div className="flex flex-1 flex-col items-center px-6 pt-5">
        <p className="mb-4 text-center text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
          全国1,500基以上の名号碑を巡り<br />デジタルスタンプを集めよう
        </p>

        <div className="w-full max-w-xs space-y-2.5">
          <Link
            href="/login"
            className="block w-full rounded-full py-3 text-center text-base tracking-wide shadow-lg"
            style={{ backgroundColor: '#b35c44', color: '#ffffff' }}
          >
            はじめる
          </Link>
          <Link
            href="/map"
            className="block w-full rounded-full py-3 text-center text-base shadow-lg"
            style={{ backgroundColor: '#b35c44', color: '#ffffff' }}
          >
            ログインせずに地図を見る
          </Link>
        </div>
      </div>
    </main>
  )
}

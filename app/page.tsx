import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) redirect('/map')
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6 relative"
      style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: '420px', backgroundRepeat: 'repeat' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }} />
      <div className="relative z-10 mb-8 mt-16 text-center">
        <p className="mb-2 text-sm tracking-[0.3em]" style={{ color: '#423629' }}>江戸時代 念仏行者</p>
        <h1 className="text-4xl tracking-widest" style={{ color: '#423629' }}>徳本上人</h1>
        <p className="mt-1 text-4xl tracking-widest" style={{ color: '#423629' }}>名号碑めぐり</p>
      </div>

      <div className="relative z-10 mb-6 flex justify-center">
        <img src="/monk.png" alt="徳本上人" className="h-36 w-auto drop-shadow-md" />
      </div>

      <div className="relative z-10 mb-10 text-center">
        <img src="/namu.png" alt="南無阿弥陀仏" className="h-16 w-auto mx-auto" />
        <p className="mt-4 text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
          全国1,500基以上の名号碑を巡り<br />デジタルスタンプを集めよう
        </p>
      </div>

      <div className="relative z-10 w-full max-w-xs space-y-3">
        <Link
          href="/login"
          className="block w-full rounded-xl py-3.5 text-center text-lg tracking-wide shadow-lg"
          style={{ backgroundColor: '#b35c44', color: '#ffffff' }}
        >
          はじめる
        </Link>
        <Link
          href="/map"
          className="block w-full rounded-xl py-3.5 text-center text-white shadow-lg"
          style={{ backgroundColor: '#b35c44' }}
        >
          ログインせずに地図を見る
        </Link>
      </div>
    </main>
  )
}

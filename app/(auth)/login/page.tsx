'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/map')
    })
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setInfo('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
    } else {
      router.replace('/map')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-2xl" style={{ color: '#423629' }}>ログイン</p>
          <p className="mt-1 text-sm" style={{ color: '#5a5a5a' }}>名号碑めぐりへようこそ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm" style={{ color: '#423629' }}>メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#b35c44] focus:ring-1 focus:ring-[#b35c44]" />
          </div>
          <div>
            <label className="mb-1 block text-sm" style={{ color: '#423629' }}>パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#b35c44] focus:ring-1 focus:ring-[#b35c44]" />
          </div>

          {info && <p className="rounded-lg bg-amber-50 p-3 text-sm" style={{ color: '#b35c44' }}>{info}</p>}

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-white disabled:opacity-60"
            style={{ backgroundColor: '#b35c44' }}>
            {loading && <Loader2 size={18} className="animate-spin" />}
            ログイン
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#5a5a5a' }}>
          アカウントがない方は{' '}
          <Link href="/register" className="underline" style={{ color: '#b35c44' }}>新規登録</Link>
        </p>
        <div className="mt-4 text-center">
          <Link href="/map" className="text-xs underline" style={{ color: '#5a5a5a' }}>ログインせずに続ける</Link>
        </div>
      </div>
    </div>
  )
}

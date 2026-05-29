'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/map')
    })
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? '登録に失敗しました')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, nickname } as any)

    if (profileError) {
      setError('プロフィールの作成に失敗しました')
      setLoading(false)
      return
    }

    router.replace('/map')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-2xl" style={{ color: '#423629' }}>新規登録</p>
          <p className="mt-1 text-sm" style={{ color: '#5a5a5a' }}>巡礼の旅をはじめましょう</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm" style={{ color: '#423629' }}>ニックネーム</label>
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required maxLength={20} placeholder="巡礼者の名前"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#b35c44] focus:ring-1 focus:ring-[#b35c44]" />
          </div>
          <div>
            <label className="mb-1 block text-sm" style={{ color: '#423629' }}>メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#b35c44] focus:ring-1 focus:ring-[#b35c44]" />
          </div>
          <div>
            <label className="mb-1 block text-sm" style={{ color: '#423629' }}>パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="8文字以上"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#b35c44] focus:ring-1 focus:ring-[#b35c44]" />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-white disabled:opacity-60"
            style={{ backgroundColor: '#b35c44' }}>
            {loading && <Loader2 size={18} className="animate-spin" />}
            登録して巡礼をはじめる
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#5a5a5a' }}>
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="underline" style={{ color: '#b35c44' }}>ログイン</Link>
        </p>
      </div>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex flex-col items-center gap-1 rounded-xl p-2 flex-shrink-0"
      style={{ color: '#5a5a5a' }}
    >
      <LogOut size={18} />
      <span className="text-[10px]">ログアウト</span>
    </button>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stamp } from 'lucide-react'
import { CheckInModal } from '@/components/stamp/CheckInModal'
import type { Monument } from '@/lib/types/database.types'

interface Props {
  monument: Monument
  userId: string | null
  isStamped: boolean
}

export function CheckInButton({ monument, userId, isStamped }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  if (isStamped) {
    return (
      <div className="w-full rounded-xl bg-stone-100 py-3 text-center text-sm font-medium text-stone-500">
        チェックイン済み
      </div>
    )
  }

  if (!userId) {
    return (
      <a
        href="/login"
        className="block w-full rounded-xl bg-amber-700 py-3 text-center font-bold text-white"
      >
        ログインしてチェックインする
      </a>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 font-bold text-white"
      >
        <Stamp size={20} />
        チェックインする
      </button>

      {open && (
        <CheckInModal
          monument={monument}
          userId={userId}
          onSuccess={() => { setOpen(false); router.refresh() }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

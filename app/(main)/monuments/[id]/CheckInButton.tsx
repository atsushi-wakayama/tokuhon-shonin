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
      <div className="w-full rounded-xl py-3 text-center text-sm font-medium" style={{ backgroundColor: '#d9cdbe', color: '#3a2a1a' }}>
        チェックイン済
      </div>
    )
  }

  if (!userId) {
    return (
      <a href="/login" className="block w-full rounded-xl py-3 text-center font-medium text-white" style={{ backgroundColor: '#b35c44' }}>
        ログインしてチェックインする
      </a>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white"
        style={{ backgroundColor: '#b35c44' }}
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

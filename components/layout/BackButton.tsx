'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  fallbackHref: string
}

export function BackButton({ fallbackHref }: Props) {
  const router = useRouter()

  function handleClick() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-full p-2 shadow-sm"
      style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #d4c5b0' }}
    >
      <ArrowLeft size={18} style={{ color: '#4a3a2a' }} />
    </button>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Map, List, BookOpen, User } from 'lucide-react'

interface Props {
  avatarUrl?: string | null
  initial?: string
}

const NAV_ITEMS = [
  { href: '/map',       label: 'マップ',       Icon: Map      },
  { href: '/monuments', label: 'スポット',     Icon: List     },
  { href: '/about',     label: '上人について', Icon: BookOpen },
  { href: '/mypage',    label: 'マイページ',   Icon: User     },
]

export function BottomNav({ avatarUrl, initial }: Props) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    let pending = false

    function update() {
      if (pending) return
      pending = true
      requestAnimationFrame(() => {
        pending = false
        const el = navRef.current
        if (!el || !vv) return

        // vv.scale は iOS Safari で常に 1 を返すことがあるため vv.width から計算
        const scale = window.innerWidth / vv.width
        if (scale <= 1.01) {
          el.style.transform = ''
          return
        }

        // ズームをキャンセルしてビジュアルビューポートの底に固定
        const offsetLeft = vv.offsetLeft
        const offsetTop = vv.offsetTop + vv.height - window.innerHeight
        el.style.transform = `translate(${offsetLeft}px, ${offsetTop}px) scale(${1 / scale})`
        el.style.transformOrigin = 'bottom left'
      })
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    // ピンチ中のリアルタイム追従（iOS Safari は resize が遅延することがある）
    window.addEventListener('touchmove', update, { passive: true })
    window.addEventListener('touchend', update, { passive: true })
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      window.removeEventListener('touchmove', update)
      window.removeEventListener('touchend', update)
    }
  }, [])

  return (
    <nav ref={navRef} className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          const isMypage = href === '/mypage'

          return (
            <li key={href} className="flex-1">
              <Link href={href}
                className="flex flex-col items-center gap-1 py-3 text-xs transition-colors"
                style={{ color: active ? '#b35c44' : '#9ca3af' }}>
                {isMypage && avatarUrl ? (
                  <div className="relative h-[22px] w-[22px] overflow-hidden rounded-full"
                    style={{ border: `1.5px solid ${active ? '#b35c44' : '#9ca3af'}` }}>
                    <Image src={avatarUrl} alt="アバター" fill className="object-cover" />
                  </div>
                ) : isMypage && initial ? (
                  <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ border: `1.5px solid ${active ? '#b35c44' : '#9ca3af'}`, color: active ? '#b35c44' : '#9ca3af' }}>
                    {initial}
                  </div>
                ) : (
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                )}
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

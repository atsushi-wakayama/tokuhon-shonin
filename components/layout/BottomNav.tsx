'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, List, BookOpen, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/map',       label: 'マップ',     Icon: Map      },
  { href: '/monuments', label: 'スポット',   Icon: List     },
  { href: '/about',     label: '上人について', Icon: BookOpen },
  { href: '/mypage',    label: 'マイページ', Icon: User     },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-sm">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? 'text-amber-700' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

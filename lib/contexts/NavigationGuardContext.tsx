'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type PendingNav = { type: 'href'; href: string } | { type: 'back'; fallback: string }

interface NavigationGuardValue {
  isBlocked: boolean
  setBlocked: (blocked: boolean) => void
  pendingNav: PendingNav | null
  requestNavigation: (target: PendingNav) => void
  confirmNavigation: () => void
  cancelNavigation: () => void
}

const NavigationGuardContext = createContext<NavigationGuardValue | null>(null)

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isBlocked, setIsBlocked] = useState(false)
  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null)

  const setBlocked = useCallback((blocked: boolean) => setIsBlocked(blocked), [])

  const doNavigate = useCallback((target: PendingNav) => {
    if (target.type === 'back') {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back()
      } else {
        router.push(target.fallback)
      }
    } else {
      router.push(target.href)
    }
  }, [router])

  const requestNavigation = useCallback((target: PendingNav) => {
    if (isBlocked) {
      setPendingNav(target)
    } else {
      doNavigate(target)
    }
  }, [isBlocked, doNavigate])

  const confirmNavigation = useCallback(() => {
    setPendingNav((current) => {
      if (current) {
        setIsBlocked(false)
        doNavigate(current)
      }
      return null
    })
  }, [doNavigate])

  const cancelNavigation = useCallback(() => setPendingNav(null), [])

  return (
    <NavigationGuardContext.Provider
      value={{ isBlocked, setBlocked, pendingNav, requestNavigation, confirmNavigation, cancelNavigation }}
    >
      {children}
    </NavigationGuardContext.Provider>
  )
}

export function useNavigationGuard() {
  const ctx = useContext(NavigationGuardContext)
  if (!ctx) throw new Error('useNavigationGuard must be used within NavigationGuardProvider')
  return ctx
}

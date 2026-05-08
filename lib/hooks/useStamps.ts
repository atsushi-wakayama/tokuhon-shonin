'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StampWithMonument } from '@/lib/types/database.types'

export function useStamps(userId: string | null) {
  const [stamps, setStamps] = useState<StampWithMonument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    const supabase = createClient()

    async function fetch() {
      const { data } = await supabase
        .from('stamps')
        .select('*, monument:monuments(*)')
        .eq('user_id', userId as string)
        .order('checked_in_at', { ascending: false })

      setStamps((data as StampWithMonument[]) ?? [])
      setLoading(false)
    }

    fetch()
  }, [userId])

  return { stamps, loading }
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MonumentWithArea } from '@/lib/types/database.types'

export function useMonuments(areaId?: number) {
  const [monuments, setMonuments] = useState<MonumentWithArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetch() {
      setLoading(true)
      // PostGIS geometry を lat/lng に変換するため RPC か computed column を使用
      // ここでは Supabase の st_x/st_y 関数で取得する例
      let query = supabase
        .from('monuments')
        .select(`
          *,
          area:areas(*)
        `)
        .order('name')

      if (areaId) {
        query = query.eq('area_id', areaId)
      }

      const { data, error } = await query
      if (error) {
        setError(error.message)
      } else {
        setMonuments((data as MonumentWithArea[]) ?? [])
      }
      setLoading(false)
    }

    fetch()
  }, [areaId])

  return { monuments, loading, error }
}

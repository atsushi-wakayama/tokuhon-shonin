'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { haversineDistance, CHECKIN_RADIUS_M } from '@/lib/utils/distance'
import type { Monument } from '@/lib/types/database.types'

type CheckInStatus = 'idle' | 'uploading' | 'success' | 'error'

export function useCheckIn() {
  const [status, setStatus] = useState<CheckInStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function checkIn({
    monument,
    userLat,
    userLng,
    photoFile,
    userId,
  }: {
    monument: Monument
    userLat: number
    userLng: number
    photoFile: File
    userId: string
  }) {
    setStatus('uploading')
    setErrorMessage(null)

    // 距離チェック（開発中は無効）
    // const dist = haversineDistance(userLat, userLng, monument.latitude, monument.longitude)
    // if (dist > CHECKIN_RADIUS_M) {
    //   setStatus('error')
    //   setErrorMessage(`名号碑まで約${Math.round(dist)}m離れています。${CHECKIN_RADIUS_M}m以内に近づいてください。`)
    //   return false
    // }

    const supabase = createClient()

    // 写真を Storage にアップロード
    const ext = photoFile.name.split('.').pop()
    const path = `stamps/${userId}/${monument.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('user-photos')
      .upload(path, photoFile, { upsert: false })

    if (uploadError) {
      setStatus('error')
      setErrorMessage('写真のアップロードに失敗しました')
      return false
    }

    const { data: urlData } = supabase.storage.from('user-photos').getPublicUrl(path)

    // サーバー側で距離の最終確認（PostGIS） + スタンプ保存
    const { error: stampError } = await supabase.from('stamps').insert({
      user_id: userId,
      monument_id: monument.id,
      photo_url: urlData.publicUrl,
      latitude: userLat,
      longitude: userLng,
    } as any)

    if (stampError) {
      setStatus('error')
      setErrorMessage(
        stampError.code === '23505'
          ? 'この名号碑はすでにスタンプ済みです'
          : 'チェックインに失敗しました'
      )
      return false
    }

    setStatus('success')
    return true
  }

  return { checkIn, status, errorMessage }
}

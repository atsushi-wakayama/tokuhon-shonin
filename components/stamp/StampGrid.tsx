import Image from 'next/image'
import type { StampWithMonument } from '@/lib/types/database.types'

interface Props {
  stamps: StampWithMonument[]
}

export function StampGrid({ stamps }: Props) {
  if (stamps.length === 0) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="rounded-xl px-5 py-4 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
          <p className="text-base" style={{ color: '#423629' }}>まだスタンプがありません</p>
          <p className="mt-1 text-base" style={{ color: '#5a5a5a' }}>名号碑を訪れてチェックインしましょう</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stamps.map((stamp) => (
        <div key={stamp.id} className="overflow-hidden rounded-xl shadow-sm">
          <div className="relative aspect-square bg-stone-100">
            <Image
              src={stamp.photo_url}
              alt={stamp.monument?.name ?? ''}
              fill
              className="object-cover"
            />
          </div>
          <div className="bg-white px-2 py-2">
            <p className="truncate text-xs font-medium text-stone-800">
              {stamp.monument?.name}
            </p>
            <p className="text-xs text-stone-400">
              {new Date(stamp.checked_in_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

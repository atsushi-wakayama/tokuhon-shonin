import Image from 'next/image'
import type { StampWithMonument } from '@/lib/types/database.types'

interface Props {
  stamps: StampWithMonument[]
}

export function StampGrid({ stamps }: Props) {
  if (stamps.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-stone-400">
        <p className="text-4xl">南無阿弥陀仏</p>
        <p className="mt-4 text-sm">まだスタンプがありません</p>
        <p className="text-sm">名号碑を訪れてチェックインしましょう</p>
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

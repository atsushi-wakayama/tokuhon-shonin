import Link from 'next/link'
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
    <div className="space-y-3">
      {stamps.map((stamp) => (
        <Link key={stamp.id} href={`/mypage/stamps/${stamp.id}`}>
          <div
            className="flex items-center gap-3 rounded-xl p-3 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99]"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <Image src={stamp.photo_url} alt={stamp.monument?.name ?? ''} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate" style={{ color: '#423629' }}>{stamp.monument?.name}</p>
              <p className="mt-1 text-xs" style={{ color: '#5a5a5a' }}>
                {new Date(stamp.checked_in_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

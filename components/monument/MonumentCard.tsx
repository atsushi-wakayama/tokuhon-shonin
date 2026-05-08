import Link from 'next/link'
import Image from 'next/image'
import { MapPin, CheckCircle } from 'lucide-react'
import type { MonumentWithArea } from '@/lib/types/database.types'

interface Props {
  monument: MonumentWithArea
  isStamped?: boolean
}

export function MonumentCard({ monument, isStamped }: Props) {
  return (
    <Link href={`/monuments/${monument.id}`}>
      <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99]">
        {/* サムネイル */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
          {monument.image_urls[0] ? (
            <Image
              src={monument.image_urls[0]}
              alt={monument.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-stone-300">
              南
            </div>
          )}
          {isStamped && (
            <div className="absolute inset-0 flex items-center justify-center bg-amber-900/60">
              <CheckCircle className="text-white" size={28} />
            </div>
          )}
        </div>

        {/* テキスト */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-stone-800">{monument.name}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
            <MapPin size={12} />
            <span className="truncate">{monument.prefecture}</span>
            {monument.area && (
              <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                {monument.area.name}
              </span>
            )}
          </div>
        </div>

        {/* スタンプ済みバッジ */}
        {isStamped && (
          <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            済
          </span>
        )}
      </div>
    </Link>
  )
}

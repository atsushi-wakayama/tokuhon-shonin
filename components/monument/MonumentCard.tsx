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
      <div className="flex items-center gap-3 rounded-xl p-3 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99]"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}>
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
          {monument.image_urls[0] ? (
            <Image src={monument.image_urls[0]} alt={monument.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg text-center"
              style={{ backgroundColor: '#fdf0e8' }}>
              <span className="text-xs leading-tight" style={{ color: '#b35c44' }}>
                {monument.area?.name ?? monument.prefecture}
              </span>
            </div>
          )}
          {isStamped && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(67, 54, 41, 0.6)' }}>
              <CheckCircle className="text-white" size={28} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate" style={{ color: '#423629' }}>{monument.name}</p>
          <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: '#5a5a5a' }}>
            <MapPin size={12} className="flex-shrink-0" />
            <span className="truncate">{monument.address ?? monument.prefecture}</span>
          </div>
        </div>

        {isStamped && (
          <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: '#fdf0e8', color: '#b35c44' }}>
            済
          </span>
        )}
      </div>
    </Link>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { MOCK_MONUMENTS } from '@/lib/mock/monuments'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { MapPin } from 'lucide-react'
import Link from 'next/link'

// Google Maps APIキー未設定時のフォールバック: SVGマップ風の一覧表示
export default function MapPage() {
  const { latitude, longitude } = useGeolocation()
  const [selected, setSelected] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // APIキーがある場合はGoogle Maps、ない場合はカード一覧で代替
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return <MapFallback selected={selected} onSelect={setSelected} />
  }

  return <GoogleMapView apiKey={apiKey} latitude={latitude} longitude={longitude} />
}

function MapFallback({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string) => void
}) {
  const sel = MOCK_MONUMENTS.find((m) => m.id === selected)

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      {/* 擬似マップ背景 */}
      <div className="relative flex-1 overflow-hidden bg-stone-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-center text-sm text-stone-400">
            Google Maps APIキーを設定すると<br />地図が表示されます
          </p>
        </div>
        {/* ピン（相対位置で並べる） */}
        {MOCK_MONUMENTS.map((m, i) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              position: 'absolute',
              left: `${15 + i * 16}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            className="flex flex-col items-center"
          >
            <div className={`rounded-full p-2 shadow-md transition-transform ${selected === m.id ? 'scale-125 bg-amber-700' : 'bg-white'}`}>
              <MapPin size={18} className={selected === m.id ? 'text-white' : 'text-amber-700'} />
            </div>
          </button>
        ))}
      </div>

      {/* 下部カード */}
      {sel ? (
        <div className="border-t border-stone-200 bg-white p-4">
          <p className="font-bold text-stone-800">{sel.name}</p>
          <p className="mt-0.5 text-xs text-stone-500">{sel.prefecture} · {sel.area?.name}</p>
          <Link
            href={`/monuments/${sel.id}`}
            className="mt-3 block w-full rounded-xl bg-amber-700 py-2.5 text-center text-sm font-bold text-white"
          >
            詳細を見る
          </Link>
        </div>
      ) : (
        <div className="border-t border-stone-200 bg-white p-4">
          <p className="text-center text-sm text-stone-400">ピンをタップして詳細を確認</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {MOCK_MONUMENTS.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className="flex-shrink-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-left"
              >
                <p className="text-xs font-medium text-stone-700">{m.name}</p>
                <p className="text-xs text-stone-400">{m.prefecture}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GoogleMapView({
  apiKey,
  latitude,
  longitude,
}: {
  apiKey: string
  latitude: number | null
  longitude: number | null
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      const loader = new Loader({ apiKey, version: 'weekly', language: 'ja', region: 'JP' })
      loader.load().then(async () => {
        const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary

        const map = new Map(mapRef.current!, {
          center: { lat: latitude ?? 36.2, lng: 138.25 },
          zoom: latitude ? 13 : 5,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: true,
          zoomControl: true,
        })

        MOCK_MONUMENTS.forEach((m) => {
          const pin = new PinElement({ background: '#92400e', borderColor: '#78350f', glyphColor: '#fef3c7', scale: 1.2 })
          const marker = new AdvancedMarkerElement({ map, position: { lat: m.latitude, lng: m.longitude }, title: m.name, content: pin.element })
          marker.addListener('click', () => { window.location.href = `/monuments/${m.id}` })
        })
        setLoaded(true)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative h-[calc(100vh-5rem)]">
      <div ref={mapRef} className="h-full w-full" />
      {!loaded && <div className="absolute inset-0 flex items-center justify-center bg-stone-100"><p className="text-sm text-stone-500">地図を読み込み中...</p></div>}
    </div>
  )
}

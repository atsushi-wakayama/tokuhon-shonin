'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { MapPin, X } from 'lucide-react'
import Link from 'next/link'

// PostGIS WKB hex → lat/lng パーサー（ブラウザ対応）
function parseWKBPoint(hex: string): { lat: number; lng: number } | null {
  try {
    const bytes = new Uint8Array(hex.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
    const view = new DataView(bytes.buffer)
    const le = bytes[0] === 1
    const wkbType = view.getUint32(1, le)
    const hasSrid = (wkbType & 0x20000000) !== 0
    const offset = 1 + 4 + (hasSrid ? 4 : 0)
    const x = view.getFloat64(offset, le)
    const y = view.getFloat64(offset + 8, le)
    if (!isFinite(x) || !isFinite(y)) return null
    return { lat: y, lng: x }
  } catch { return null }
}

function getCoords(m: any): { lat: number; lng: number } | null {
  if (m.location && typeof m.location === 'object' && Array.isArray(m.location.coordinates)) {
    return { lat: m.location.coordinates[1], lng: m.location.coordinates[0] }
  }
  if (typeof m.location === 'string' && m.location.length > 10) {
    return parseWKBPoint(m.location)
  }
  if (typeof m.latitude === 'number' && typeof m.longitude === 'number') {
    return { lat: m.latitude, lng: m.longitude }
  }
  return null
}

// 日本の表示範囲
const LAT_MIN = 31, LAT_MAX = 42
const LNG_MIN = 129, LNG_MAX = 142

function toPercent(lat: number, lng: number) {
  const left = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100
  const top = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100
  return { left, top }
}

export default function MapPage() {
  const { latitude, longitude } = useGeolocation()
  const [monuments, setMonuments] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('monuments').select('*, area:areas(*)').order('name')
      .then(({ data }) => { if (data) setMonuments(data) })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  // ログイン済みの場合、ブラウザの戻るボタンでマップ画面を離れないよう制御
  useEffect(() => {
    if (!isLoggedIn) return
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isLoggedIn])

  // マップ画面全体のブラウザネイティブズームを阻止（GoogleMapView / MapFallback 両方に適用）
  useEffect(() => {
    document.documentElement.classList.add('map-active')
    const opts = { passive: false, capture: true } as AddEventListenerOptions
    const blockGesture = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', blockGesture, opts)
    document.addEventListener('gesturechange', blockGesture, opts)
    return () => {
      document.documentElement.classList.remove('map-active')
      const capOpts = { capture: true }
      document.removeEventListener('gesturestart', blockGesture, capOpts)
      document.removeEventListener('gesturechange', blockGesture, capOpts)
    }
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return <MapFallback monuments={monuments} selected={selected} onSelect={setSelected} />
  }

  return <GoogleMapView apiKey={apiKey} latitude={latitude} longitude={longitude} monuments={monuments} />
}

function MapFallback({
  monuments,
  selected,
  onSelect,
}: {
  monuments: any[]
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const showLabels = zoom >= 2
  const sel = monuments.find((m) => m.id === selected)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastDist = useRef<number | null>(null)
  const lastPan = useRef<{ x: number; y: number } | null>(null)

  // zoom が 1 に戻ったらパンもリセット
  useEffect(() => { if (zoom <= 1) setPan({ x: 0, y: 0 }) }, [zoom])

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastDist.current = Math.sqrt(dx * dx + dy * dy)
      lastPan.current = null
    } else if (e.touches.length === 1) {
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      lastDist.current = null
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && lastDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const ratio = dist / lastDist.current
      setZoom(z => Math.min(Math.max(z * ratio, 1), 5))
      lastDist.current = dist
    } else if (e.touches.length === 1 && lastPan.current) {
      const dx = e.touches[0].clientX - lastPan.current.x
      const dy = e.touches[0].clientY - lastPan.current.y
      setPan(p => ({ x: p.x + dx / zoom, y: p.y + dy / zoom }))
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) lastDist.current = null
    if (e.touches.length < 1) lastPan.current = null
  }

  return (
    <div ref={containerRef} className="relative flex flex-col h-[calc(100dvh-5rem-env(safe-area-inset-bottom,0px))] overflow-hidden"
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>

      {/* ズームボタン */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
        <button onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold shadow-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#423629', border: '1px solid #d4c5b0' }}>+</button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold shadow-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#423629', border: '1px solid #d4c5b0' }}>−</button>
      </div>

      {/* マップエリア（overflow:hidden + CSS transform でズーム・パン） */}
      <div className="flex-1 overflow-hidden"
        style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: '200px', backgroundRepeat: 'repeat', backgroundColor: '#e8e0d5' }}>
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}>

          {monuments.map((m) => {
            const coords = getCoords(m)
            if (!coords) return null
            const { left, top } = toPercent(coords.lat, coords.lng)
            if (left < 0 || left > 100 || top < 0 || top > 100) return null
            const isSelected = selected === m.id
            return (
              <button
                key={m.id}
                onClick={() => onSelect(isSelected ? null : m.id)}
                style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -100%)', zIndex: isSelected ? 10 : 1 }}
                className="flex flex-col items-center"
              >
                <div className={`rounded-full p-1.5 shadow-md transition-all ${isSelected ? 'scale-125' : ''}`}
                  style={{ backgroundColor: isSelected ? '#b35c44' : '#fff', border: `2px solid ${isSelected ? '#8c3d2e' : '#d4c5b0'}` }}>
                  <MapPin size={14} style={{ color: isSelected ? '#fff' : '#8B4513' }} />
                </div>
                {showLabels && (
                  <span className="mt-0.5 max-w-[80px] truncate rounded px-1 py-0.5 text-center text-[10px] leading-tight shadow-sm"
                    style={{ backgroundColor: isSelected ? '#b35c44' : 'rgba(255,255,255,0.92)', color: isSelected ? '#fff' : '#423629', border: '1px solid #d4c5b0', transform: 'translateY(100%)' }}>
                    {m.name}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択中のポップアップ */}
      {sel && (
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl p-4 shadow-lg z-20"
          style={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #d4c5b0' }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium truncate" style={{ color: '#423629' }}>{sel.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#8B4513' }}>{sel.prefecture} · {sel.area?.name}</p>
            </div>
            <button onClick={() => onSelect(null)} className="flex-shrink-0 p-1 rounded-full" style={{ color: '#5a5a5a' }}>
              <X size={16} />
            </button>
          </div>
          <Link href={`/monuments/${sel.id}`}
            className="mt-3 block w-full rounded-xl py-2.5 text-center text-sm font-medium text-white"
            style={{ backgroundColor: '#b35c44' }}>
            詳細を見る
          </Link>
        </div>
      )}
    </div>
  )
}

function GoogleMapView({
  apiKey,
  latitude,
  longitude,
  monuments,
}: {
  apiKey: string
  latitude: number | null
  longitude: number | null
  monuments: any[]
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || monuments.length === 0) return
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      const loader = new Loader({ apiKey, version: 'weekly', language: 'ja', region: 'JP' })
      loader.load().then(async () => {
        const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary

        const map = new Map(mapRef.current!, {
          center: { lat: latitude ?? 36.2, lng: longitude ?? 138.25 },
          zoom: latitude ? 13 : 5,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: true,
          zoomControl: true,
        })

        monuments.forEach((m) => {
          const coords = getCoords(m)
          if (!coords) return
          const pin = new PinElement({ background: '#92400e', borderColor: '#78350f', glyphColor: '#fef3c7', scale: 1.2 })
          const marker = new AdvancedMarkerElement({ map, position: { lat: coords.lat, lng: coords.lng }, title: m.name, content: pin.element })
          marker.addListener('click', () => { window.location.href = `/monuments/${m.id}` })
        })
        setLoaded(true)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monuments])

  return (
    <div className="relative h-[calc(100dvh-5rem-env(safe-area-inset-bottom,0px))]">
      <div ref={mapRef} className="h-full w-full" />
      {!loaded && <div className="absolute inset-0 flex items-center justify-center bg-stone-100"><p className="text-sm text-stone-500">地図を読み込み中...</p></div>}
    </div>
  )
}

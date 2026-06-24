'use client'

import { useActionState, useState, useRef, useEffect } from 'react'

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]
import { ArrowLeft, MapPin, X } from 'lucide-react'
import { useNavigationGuard } from '@/lib/contexts/NavigationGuardContext'

const washibg = [
  'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
].join(', ')
import { createMonument } from './actions'

type Area = {
  id: number
  name: string
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 inline-block text-sm font-medium" style={{ color: '#423629' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

export function CreateForm({ areas }: { areas: Area[] }) {
  const [state, formAction, isPending] = useActionState(createMonument, null)
  const [isDirty, setIsDirty] = useState(false)
  const { setBlocked, requestNavigation, pendingNav, confirmNavigation, cancelNavigation } = useNavigationGuard()
  useEffect(() => {
    setBlocked(isDirty)
    return () => setBlocked(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [pendingLat, setPendingLat] = useState<number | null>(null)
  const [pendingLng, setPendingLng] = useState<number | null>(null)

  const mapPickerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)

  // 全画面マップピッカーの初期化（中央固定ピン方式）
  useEffect(() => {
    if (!showMapPicker || !mapPickerRef.current) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') return

    const initLat = latitude ?? 36.2
    const initLng = longitude ?? 138.25
    const initZoom = latitude !== null ? 15 : 6
    setPendingLat(initLat)
    setPendingLng(initLng)

    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      const loader = new Loader({ apiKey, version: 'weekly', language: 'ja', region: 'JP' })
      loader.load().then(async () => {
        const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary

        const map = new Map(mapPickerRef.current!, {
          center: { lat: initLat, lng: initLng },
          zoom: initZoom,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        })
        mapInstanceRef.current = map

        map.addListener('center_changed', () => {
          const c = map.getCenter()
          if (!c) return
          setPendingLat(Math.round(c.lat() * 10000) / 10000)
          setPendingLng(Math.round(c.lng() * 10000) / 10000)
        })
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapPicker])

  function confirmMapPosition() {
    if (pendingLat !== null && pendingLng !== null) {
      setLatitude(pendingLat)
      setLongitude(pendingLng)
      setIsDirty(true)
    }
    mapInstanceRef.current = null
    setShowMapPicker(false)
  }

  function cancelMapPicker() {
    mapInstanceRef.current = null
    setShowMapPicker(false)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget)
    const hasValue =
      !!(fd.get('name') as string) ||
      !!(fd.get('prefecture') as string) ||
      !!(fd.get('address') as string) ||
      !!(fd.get('description') as string) ||
      !!(fd.get('access_info') as string)
    setIsDirty(hasValue)
  }

  const preventEnterSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.preventDefault()
  }

  const handleBack = () => {
    requestNavigation({ type: 'href', href: '/admin' })
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#f5f0eb' }}
    >
      {pendingNav && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white px-6 py-6 text-center shadow-lg">
            <p className="mb-5 text-base font-medium" style={{ color: '#3a2a1a' }}>
              入力内容が保存されていません。<br />破棄して戻りますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelNavigation}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }}
              >
                入力に戻る
              </button>
              <button
                onClick={confirmNavigation}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: '#b35c44' }}
              >
                破棄して戻る
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md">
        <div className="px-4 pb-5 pt-4" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>
          <button
            onClick={handleBack}
            className="mb-3 inline-flex items-center justify-center rounded-full p-2 shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #d4c5b0' }}
          >
            <ArrowLeft size={18} style={{ color: '#4a3a2a' }} />
          </button>
          <h1 className="text-2xl font-medium leading-snug" style={{ color: '#3a2a1a' }}>
            スポット新規追加
          </h1>
        </div>

        <form action={formAction} onChange={handleFormChange} className="space-y-4 px-4 pt-4 pb-8">
          {state?.error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: '#fdf0e8', color: '#c05c44', border: '1px solid #e8c8b0' }}
            >
              {state.error}
            </div>
          )}

          <Field label="スポット名" required>
            <input
              name="name"
              required
              onKeyDown={preventEnterSubmit}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="都道府県" required>
            <select
              name="prefecture"
              defaultValue=""
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="所在地">
            <input
              name="address"
              onKeyDown={preventEnterSubmit}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="位置情報">
            {latitude !== null && <input type="hidden" name="latitude" value={latitude} readOnly />}
            {longitude !== null && <input type="hidden" name="longitude" value={longitude} readOnly />}
            {latitude !== null && longitude !== null && (
              <p className="mb-2 mt-2 flex items-center gap-1 text-sm" style={{ color: '#2d7a3a' }}>
                <MapPin size={14} />
                位置指定済（{latitude.toFixed(4)}, {longitude.toFixed(4)}）
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="block text-xs underline"
              style={{ color: '#b35c44' }}
            >
              {latitude !== null ? '地図上で位置を変更する' : '地図上で位置を指定する'}
            </button>
          </Field>

          <Field label="エリア">
            <select
              name="area_id"
              defaultValue=""
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            >
              <option value="">未設定</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="解説">
            <textarea
              name="description"
              rows={4}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="アクセス情報">
            <textarea
              name="access_info"
              rows={3}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="現地確認">
            <select
              name="is_verified"
              defaultValue="false"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            >
              <option value="false">未確認</option>
              <option value="true">確認済</option>
            </select>
          </Field>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl py-3.5 text-base font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#b35c44' }}
          >
            {isPending ? '追加中...' : '追加する'}
          </button>
        </form>
      </div>

      {/* 全画面マップピッカー */}
      {showMapPicker && (
        <div className="fixed inset-0 z-[60] bg-white">
          <div ref={mapPickerRef} className="absolute inset-0" />

          {/* 中央固定ピン */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
            <MapPin size={40} style={{ color: '#b35c44' }} fill="#b35c44" />
          </div>

          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={cancelMapPicker}
            className="absolute right-4 top-4 rounded-full bg-white p-2 shadow-md"
            style={{ color: '#423629' }}
          >
            <X size={20} />
          </button>

          {/* 案内・決定ボタン */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div
              className="rounded-2xl p-4 text-center shadow-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
            >
              <p className="mb-3 text-sm" style={{ color: '#5a5a5a' }}>
                地図を動かして、ピンの位置にスポットを指定してください
              </p>
              {pendingLat !== null && pendingLng !== null && (
                <p className="mb-3 text-xs" style={{ color: '#2d7a3a' }}>
                  選択中（{pendingLat.toFixed(4)}, {pendingLng.toFixed(4)}）
                </p>
              )}
              <button
                type="button"
                onClick={confirmMapPosition}
                className="w-full rounded-xl py-3 text-base font-medium text-white"
                style={{ backgroundColor: '#b35c44' }}
              >
                ここに決定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

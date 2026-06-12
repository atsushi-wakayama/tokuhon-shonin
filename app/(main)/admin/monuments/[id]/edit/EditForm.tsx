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
import { useRouter } from 'next/navigation'
import { ChevronLeft, MapPin } from 'lucide-react'
import { updateMonument } from './actions'

type Monument = {
  id: string
  name: string
  prefecture: string
  address: string | null
  area_id: number | null
  description: string | null
  access_info: string | null
  is_verified: boolean
  status: string
  latitude: number | null
  longitude: number | null
}

type Area = {
  id: number
  name: string
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 inline-block text-sm font-medium" style={{ color: '#423629', backgroundColor: 'rgba(255,255,255,0.85)', padding: '1px 6px', borderRadius: '4px' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

export function EditForm({ monument, areas }: { monument: Monument; areas: Area[] }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateMonument, null)
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(monument.latitude)
  const [longitude, setLongitude] = useState<number | null>(monument.longitude)
  const [showMapPicker, setShowMapPicker] = useState(false)

  const mapPickerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!showMapPicker || !mapPickerRef.current || mapInstanceRef.current) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') return

    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      const loader = new Loader({ apiKey, version: 'weekly', language: 'ja', region: 'JP' })
      loader.load().then(async () => {
        const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary

        const initLat = latitude ?? 36.2
        const initLng = longitude ?? 138.25
        const initZoom = latitude !== null ? 13 : 6

        const map = new Map(mapPickerRef.current!, {
          center: { lat: initLat, lng: initLng },
          zoom: initZoom,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: true,
          zoomControl: true,
        })
        mapInstanceRef.current = map

        if (latitude !== null && longitude !== null) {
          const pin = new PinElement({ background: '#b35c44', borderColor: '#8c3d2e', glyphColor: '#fff' })
          markerRef.current = new AdvancedMarkerElement({ map, position: { lat: latitude, lng: longitude }, content: pin.element })
        }

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return
          const lat = Math.round(e.latLng.lat() * 10000) / 10000
          const lng = Math.round(e.latLng.lng() * 10000) / 10000
          setLatitude(lat)
          setLongitude(lng)
          setIsDirty(true)
          if (markerRef.current) {
            markerRef.current.position = { lat, lng }
          } else {
            const pin = new PinElement({ background: '#b35c44', borderColor: '#8c3d2e', glyphColor: '#fff' })
            markerRef.current = new AdvancedMarkerElement({ map, position: { lat, lng }, content: pin.element })
          }
        })
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapPicker])

  const initialValues = useRef({
    name: monument.name,
    prefecture: monument.prefecture,
    address: monument.address ?? '',
    area_id: String(monument.area_id ?? ''),
    description: monument.description ?? '',
    access_info: monument.access_info ?? '',
    is_verified: String(monument.is_verified),
  })

  const handleFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget)
    const init = initialValues.current
    const dirty =
      (fd.get('name') as string) !== init.name ||
      (fd.get('prefecture') as string) !== init.prefecture ||
      (fd.get('address') as string) !== init.address ||
      (fd.get('area_id') as string) !== init.area_id ||
      (fd.get('description') as string) !== init.description ||
      (fd.get('access_info') as string) !== init.access_info ||
      (fd.get('is_verified') as string) !== init.is_verified
    setIsDirty(dirty)
  }

  const preventEnterSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.preventDefault()
  }

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedDialog(true)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/bg-pattern.png)',
        backgroundSize: '320px',
        backgroundRepeat: 'repeat',
        backgroundColor: '#f5f0eb',
      }}
    >
      {/* 未保存変更ダイアログ */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white px-6 py-6 text-center shadow-lg">
            <p className="mb-5 text-base font-medium" style={{ color: '#3a2a1a' }}>
              変更が保存されていません。破棄して戻りますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnsavedDialog(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }}
              >
                編集に戻る
              </button>
              <button
                onClick={() => router.push('/admin')}
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
        {/* ヘッダー */}
        <div className="px-4 pt-5 pb-4" style={{ backgroundColor: '#faf7f0' }}>
          <button
            onClick={handleBack}
            className="mb-3 flex items-center gap-1 text-sm"
            style={{ color: '#b35c44' }}
          >
            <ChevronLeft size={16} />
            管理ページに戻る
          </button>
          <h1 className="text-lg font-medium" style={{ color: '#3a2a1a' }}>
            スポット編集
          </h1>
        </div>

        <form action={formAction} onChange={handleFormChange} className="space-y-4 px-4 pt-4 pb-8">
          <input type="hidden" name="id" value={monument.id} />

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
              defaultValue={monument.name}
              required
              onKeyDown={preventEnterSubmit}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="都道府県" required>
            <select
              name="prefecture"
              defaultValue={monument.prefecture}
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
              defaultValue={monument.address ?? ''}
              onKeyDown={preventEnterSubmit}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="位置情報">
            {latitude !== null && <input type="hidden" name="latitude" value={latitude} readOnly />}
            {longitude !== null && <input type="hidden" name="longitude" value={longitude} readOnly />}
            {latitude !== null && longitude !== null && !showMapPicker && (
              <p className="mb-2 inline-flex items-center gap-1 text-sm" style={{ color: '#2d7a3a', backgroundColor: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px' }}>
                <MapPin size={14} />
                位置指定済み（{latitude.toFixed(4)}, {longitude.toFixed(4)}）
              </p>
            )}
            {!showMapPicker && (
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="text-sm underline"
                style={{ color: '#b35c44', backgroundColor: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px' }}
              >
                地図上で位置を変更する
              </button>
            )}
            {showMapPicker && (
              <div>
                <p className="mb-2 inline-block text-sm" style={{ color: '#5a5a5a', backgroundColor: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px' }}>地図をタップして位置を指定してください</p>
                <div
                  ref={mapPickerRef}
                  className="h-52 w-full overflow-hidden rounded-xl"
                  style={{ border: '2px dashed #b35c44' }}
                />
                {latitude !== null && longitude !== null ? (
                  <p className="mt-1.5 inline-block text-sm" style={{ color: '#2d7a3a', backgroundColor: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px' }}>
                    選択済み（{latitude.toFixed(4)}, {longitude.toFixed(4)}）
                  </p>
                ) : (
                  <p className="mt-1.5 inline-block text-sm" style={{ color: '#5a5a5a', backgroundColor: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px' }}>地図をタップすると位置が決まります</p>
                )}
              </div>
            )}
          </Field>

          <Field label="エリア">
            <select
              name="area_id"
              defaultValue={monument.area_id ?? ''}
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

          <Field label="解説テキスト">
            <textarea
              name="description"
              defaultValue={monument.description ?? ''}
              rows={4}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="アクセス情報">
            <textarea
              name="access_info"
              defaultValue={monument.access_info ?? ''}
              rows={3}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="現地確認済み">
            <select
              name="is_verified"
              defaultValue={String(monument.is_verified)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            >
              <option value="false">未確認</option>
              <option value="true">確認済み</option>
            </select>
          </Field>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl py-3.5 text-base font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#b35c44' }}
          >
            {isPending ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  )
}

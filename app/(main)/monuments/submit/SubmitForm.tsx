'use client'

import { useRef, useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, X, Loader2, MapPin, ChevronLeft } from 'lucide-react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { submitMonument } from './actions'

const AREAS = [
  { id: 1, label: '和歌山県' },
  { id: 3, label: '近畿・中部' },
  { id: 2, label: '関東・東京' },
  { id: 4, label: '東北' },
]

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

interface Props {
  backPath: string
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" style={{ color: '#423629' }}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

export function SubmitForm({ backPath }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapPickerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [areaId, setAreaId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [accessInfo, setAccessInfo] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { latitude: geoLat, longitude: geoLng, error: geoError, loading: geoLoading } = useGeolocation()

  // GPS取得成功時に座標を自動セット
  useEffect(() => {
    if (geoLat !== null && geoLng !== null && latitude === null) {
      setLatitude(geoLat)
      setLongitude(geoLng)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLat, geoLng])

  // GPS取得失敗時にマップピッカーを表示
  useEffect(() => {
    if (geoError) setShowMapPicker(true)
  }, [geoError])

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

  const isDirty = name !== '' || address !== '' || prefecture !== '' || description !== '' || accessInfo !== '' || photoFile !== null

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardDialog(true)
    } else {
      router.push(backPath)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
    e.target.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) {
      setSubmitError('スポット名を入力してください')
      return
    }
    if (latitude === null || longitude === null) {
      setSubmitError('場所を指定してください（GPS取得か地図上でタップ）')
      return
    }

    setSubmitError(null)
    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('latitude', String(latitude))
    fd.append('longitude', String(longitude))
    fd.append('prefecture', prefecture)
    fd.append('address', address)
    if (areaId) fd.append('area_id', areaId)
    fd.append('description', description)
    fd.append('access_info', accessInfo)
    if (photoFile) fd.append('photo', photoFile)

    startTransition(async () => {
      try {
        const result = await submitMonument(fd)
        if (result?.error) {
          setSubmitError(result.error)
        } else {
          setSubmitSuccess(true)
        }
      } catch (e) {
        console.error('[SubmitForm] submitMonument threw:', e)
        setSubmitError('申請に失敗しました。もう一度お試しください')
      }
    })
  }

  // 申請完了画面
  if (submitSuccess) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
      >
        <div className="mb-4 text-5xl">🙏</div>
        <p className="mb-2 text-lg font-medium" style={{ color: '#423629' }}>
          申請を受け付けました
        </p>
        <p className="mb-6 text-sm" style={{ color: '#5a5a5a' }}>
          管理者の確認後、スポットとして公開されます。
        </p>
        <button
          onClick={() => router.push(backPath)}
          className="w-full rounded-xl py-3 text-white"
          style={{ backgroundColor: '#b35c44' }}
        >
          戻る
        </button>
      </div>
    )
  }

  return (
    <>
      {/* 破棄確認ダイアログ */}
      {showDiscardDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white px-6 py-6 text-center shadow-lg">
            <p className="mb-5 text-base font-medium" style={{ color: '#3a2a1a' }}>
              入力内容が消えます。破棄して戻りますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDiscardDialog(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: '#423629',
                  border: '1px solid #d4c5b0',
                }}
              >
                入力に戻る
              </button>
              <button
                onClick={() => router.push(backPath)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: '#b35c44' }}
              >
                破棄して戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 戻るボタン */}
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-1 text-sm"
        style={{ color: '#b35c44', backgroundColor: 'rgba(255,255,255,0.85)', padding: '4px 10px 4px 6px', borderRadius: '8px' }}
      >
        <ChevronLeft size={16} />
        {backPath === '/map' ? 'マップに戻る' : 'スポット一覧に戻る'}
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* スポット名 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="スポット名" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：〇〇寺 徳本名号碑"
              className="w-full rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0' }}
            />
          </Field>
        </div>

        {/* 現在地 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <p className="mb-2 text-sm font-medium" style={{ color: '#423629' }}>
            現在地 <span className="ml-1 text-red-500">*</span>
          </p>

          {geoLoading && (
            <p className="flex items-center gap-2 text-sm" style={{ color: '#5a5a5a' }}>
              <Loader2 size={14} className="animate-spin" /> GPS取得中...
            </p>
          )}

          {!geoLoading && latitude !== null && longitude !== null && !showMapPicker && (
            <p className="flex items-center gap-1 text-sm" style={{ color: '#2d7a3a' }}>
              <MapPin size={14} /> 現在地を取得しました
            </p>
          )}

          {geoError && (
            <p
              className="mb-3 rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: '#fef9ec', color: '#92400e', border: '1px solid #fcd34d' }}
            >
              現在地を取得できませんでした。地図上でスポットの場所をタップして指定してください。
            </p>
          )}

          {/* マップピッカー（GPS失敗時 or 手動指定ボタン押下時） */}
          {showMapPicker && (
            <div>
              <p className="mb-2 text-xs" style={{ color: '#5a5a5a' }}>
                地図をタップして場所を指定してください
              </p>
              <div
                ref={mapPickerRef}
                className="h-52 w-full overflow-hidden rounded-xl"
                style={{ border: '2px dashed #b35c44' }}
              />
              {latitude !== null && longitude !== null ? (
                <p className="mt-1.5 text-xs" style={{ color: '#2d7a3a' }}>
                  <MapPin size={11} className="inline mr-0.5" />
                  選択済み（{latitude.toFixed(4)}, {longitude.toFixed(4)}）
                </p>
              ) : (
                <p className="mt-1.5 text-xs" style={{ color: '#5a5a5a' }}>
                  地図をタップすると位置が決まります
                </p>
              )}
            </div>
          )}

          {/* GPS成功時でも手動で変更したい場合のボタン */}
          {!showMapPicker && !geoLoading && (
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="mt-2 text-xs underline"
              style={{ color: '#b35c44' }}
            >
              地図上で指定する
            </button>
          )}
        </div>

        {/* 都道府県 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="都道府県">
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0', backgroundColor: 'white' }}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* 所在地 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="所在地">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例：和歌山県日高郡日高川町..."
              className="w-full rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0' }}
            />
          </Field>
        </div>

        {/* エリア */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="エリア">
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0', backgroundColor: 'white' }}
            >
              <option value="">選択してください</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* 解説 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="解説">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="スポットについての説明..."
              className="w-full resize-none rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0' }}
            />
          </Field>
        </div>

        {/* アクセス情報 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="アクセス情報">
            <textarea
              value={accessInfo}
              onChange={(e) => setAccessInfo(e.target.value)}
              rows={3}
              placeholder="電車・バスなどのアクセス方法..."
              className="w-full resize-none rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0' }}
            />
          </Field>
        </div>

        {/* 写真 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <p className="mb-2 text-sm font-medium" style={{ color: '#423629' }}>
            写真
          </p>
          {photoPreview ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
              <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null)
                  setPhotoPreview(null)
                }}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'image/*'
                    fileInputRef.current.setAttribute('capture', 'environment')
                    fileInputRef.current.click()
                  }
                }}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-6"
                style={{ color: '#5a5a5a' }}
              >
                <Camera size={28} />
                <span className="text-sm">カメラで撮影</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture')
                    fileInputRef.current.click()
                  }
                }}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-6"
                style={{ color: '#5a5a5a' }}
              >
                <Upload size={28} />
                <span className="text-sm">写真を選択</span>
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* エラーメッセージ */}
        {submitError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</p>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl py-3 text-base font-medium text-white disabled:opacity-40"
          style={{ backgroundColor: '#b35c44' }}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> 送信中...
            </span>
          ) : (
            '申請する'
          )}
        </button>
      </form>
    </>
  )
}

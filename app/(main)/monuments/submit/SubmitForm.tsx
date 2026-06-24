'use client'

import { useRef, useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, X, Loader2, MapPin, ArrowLeft } from 'lucide-react'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { createClient } from '@/lib/supabase/client'
import { useNavigationGuard } from '@/lib/contexts/NavigationGuardContext'
import { submitMonument } from './actions'

interface Props {
  backPath: string
}

const washibg = [
  'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
].join(', ')

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

  const [name, setName] = useState('')
  const [memo, setMemo] = useState('')
  const [adminInfo, setAdminInfo] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [pendingLat, setPendingLat] = useState<number | null>(null)
  const [pendingLng, setPendingLng] = useState<number | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { setBlocked, requestNavigation, pendingNav, confirmNavigation, cancelNavigation } = useNavigationGuard()

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
    }
    mapInstanceRef.current = null
    setShowMapPicker(false)
  }

  function cancelMapPicker() {
    mapInstanceRef.current = null
    setShowMapPicker(false)
  }

  const isDirty = name !== '' || memo !== '' || adminInfo !== '' || photoFile !== null

  useEffect(() => {
    setBlocked(isDirty)
    return () => setBlocked(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  const handleBack = () => {
    requestNavigation({ type: 'href', href: backPath })
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
      setSubmitError('場所を指定してください（GPS取得か地図で指定）')
      return
    }

    setSubmitError(null)

    startTransition(async () => {
      try {
        let photoUrl: string | null = null
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setSubmitError('未ログインです')
          return
        }

        if (photoFile) {
          const ext = photoFile.name.split('.').pop() || 'jpg'
          const path = `stamps/${user.id}/submission_${Date.now()}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from('user-photos')
            .upload(path, photoFile, { upsert: false })

          if (uploadError) {
            setSubmitError('写真のアップロードに失敗しました')
            return
          }

          const { data: urlData } = supabase.storage.from('user-photos').getPublicUrl(path)
          photoUrl = urlData.publicUrl
        }

        const fd = new FormData()
        fd.append('name', name.trim())
        fd.append('latitude', String(latitude))
        fd.append('longitude', String(longitude))
        fd.append('admin_info', adminInfo)
        fd.append('memo', memo)
        if (photoUrl) fd.append('photo_url', photoUrl)

        const result = await submitMonument(fd)
        if (result?.error) {
          setSubmitError(result.error)
          return
        }

        setBlocked(false)
        setSubmitSuccess(true)
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
      {pendingNav && (
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
                onClick={cancelNavigation}
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

      {/* ヘッダー：和紙テクスチャ */}
      <div className="px-4 pb-5 pt-4" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center rounded-full p-2 shadow-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #d4c5b0' }}
        >
          <ArrowLeft size={18} style={{ color: '#4a3a2a' }} />
        </button>
        <h1 className="mt-3 text-2xl font-medium leading-snug" style={{ color: '#4a3a2a' }}>
          新しいスポットを申請
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 pt-6">

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

          {!geoLoading && latitude !== null && longitude !== null && (
            <p className="flex items-center gap-1 text-sm" style={{ color: '#2d7a3a' }}>
              <MapPin size={14} /> 位置を取得しました（{latitude.toFixed(4)}, {longitude.toFixed(4)}）
            </p>
          )}

          {geoError && (
            <p
              className="mb-3 rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: '#fef9ec', color: '#92400e', border: '1px solid #fcd34d' }}
            >
              現在地を取得できませんでした。地図でスポットの場所を指定してください。
            </p>
          )}

          {!geoLoading && (
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="mt-2 text-xs underline"
              style={{ color: '#b35c44' }}
            >
              地図で指定する
            </button>
          )}
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
          {!photoFile && (
            <p className="mt-2 text-xs font-medium" style={{ color: '#c0392b' }}>
              ※写真がない場合、申請のみ行われます。（チェックインは行われません。）
            </p>
          )}
        </div>

        {/* ひとことメモ */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="ひとことメモ">
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder="このスポットでの思い出など..."
              className="w-full resize-none rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0' }}
            />
          </Field>
          <p className="mt-1.5 text-xs" style={{ color: '#5a5a5a' }}>
            ※マイページのスタンプ帳で承認後に編集できます。
          </p>
        </div>

        {/* 管理者への情報共有 */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
        >
          <Field label="管理者への情報共有">
            <textarea
              value={adminInfo}
              onChange={(e) => setAdminInfo(e.target.value)}
              rows={3}
              placeholder="このスポットの由来など、共有したい情報があれば..."
              className="w-full resize-none rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ border: '1px solid #d4c5b0' }}
            />
          </Field>
          <p className="mt-1.5 text-xs" style={{ color: '#5a5a5a' }}>
            ※この内容は管理者だけが見ることができます。管理者がスポットの解説を作成する際、ご提供いただいた情報を使用させていただく場合があります。ご了承ください。
          </p>
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

'use client'

import { useRef, useState } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useCheckIn } from '@/lib/hooks/useCheckIn'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import type { Monument } from '@/lib/types/database.types'

interface Props {
  monument: Monument
  userId: string
  onSuccess: () => void
  onClose: () => void
}

export function CheckInModal({ monument, userId, onSuccess, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation()
  const { checkIn, status, errorMessage } = useCheckIn()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit() {
    if (!file || latitude === null || longitude === null) return
    const ok = await checkIn({ monument, userLat: latitude, userLng: longitude, photoFile: file, userId })
    if (ok) onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50">
      <div className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 pb-24 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800">チェックイン</h2>
          <button onClick={onClose} className="rounded-full p-1 text-stone-400 hover:bg-stone-100">
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-stone-600">
          <span className="font-medium text-stone-800">{monument.name}</span> の写真を撮影または選択してスタンプを獲得しましょう。
        </p>

        {/* 写真プレビュー */}
        {preview ? (
          <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
            <img src={preview} alt="preview" className="h-full w-full object-cover" />
            <button
              onClick={() => { setPreview(null); setFile(null) }}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => { if (fileInputRef.current) { fileInputRef.current.accept = 'image/*'; fileInputRef.current.capture = 'environment'; fileInputRef.current.click() } }}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-6 text-stone-500 hover:border-amber-400 hover:text-amber-600"
            >
              <Camera size={28} />
              <span className="text-sm">カメラで撮影</span>
            </button>
            <button
              onClick={() => { if (fileInputRef.current) { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click() } }}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-200 py-6 text-stone-500 hover:border-amber-400 hover:text-amber-600"
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

        {/* エラー表示 */}
        {(geoError || errorMessage) && (
          <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {geoError || errorMessage}
          </p>
        )}

        {/* GPS状態 */}
        {geoLoading && (
          <p className="mb-3 flex items-center gap-2 text-sm text-stone-500">
            <Loader2 size={14} className="animate-spin" /> GPS取得中...
          </p>
        )}

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!file || geoLoading || status === 'uploading' || latitude === null}
          className="w-full rounded-xl bg-amber-700 py-3 font-bold text-white disabled:opacity-40"
        >
          {status === 'uploading' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> 送信中...
            </span>
          ) : (
            'スタンプを獲得する'
          )}
        </button>
      </div>
    </div>
  )
}

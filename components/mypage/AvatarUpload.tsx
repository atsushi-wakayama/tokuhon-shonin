'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Camera, X, Check } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  avatarUrl: string | null
  initial: string
}

async function getCroppedBlob(imageSrc: string, cropArea: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve(img)
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  const size = 400
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    image,
    cropArea.x, cropArea.y, cropArea.width, cropArea.height,
    0, 0, size, size,
  )
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9))
}

export function AvatarUpload({ userId, avatarUrl, initial }: Props) {
  const [currentUrl, setCurrentUrl] = useState(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels)
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setSrcUrl(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    e.target.value = ''
  }

  async function handleConfirm() {
    if (!srcUrl || !croppedArea) return
    setUploading(true)
    const blob = await getCroppedBlob(srcUrl, croppedArea)
    const supabase = createClient()
    const path = `avatars/${userId}.jpg`
    const { error } = await supabase.storage
      .from('user-photos')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
    if (!error) {
      const { data } = supabase.storage.from('user-photos').getPublicUrl(path)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`
      await (supabase.from('profiles') as any).update({ avatar_url: publicUrl }).eq('id', userId)
      setCurrentUrl(publicUrl)
    }
    URL.revokeObjectURL(srcUrl)
    setSrcUrl(null)
    setUploading(false)
  }

  function handleCancel() {
    if (srcUrl) URL.revokeObjectURL(srcUrl)
    setSrcUrl(null)
  }

  return (
    <>
      {/* アバター表示 */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => inputRef.current?.click()}
          className="relative flex h-14 w-14 items-center justify-center rounded-full overflow-hidden"
          style={{ backgroundColor: '#fdf0e8', border: '2px solid #8B4513' }}
        >
          {currentUrl ? (
            <Image src={currentUrl} alt="アバター" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="text-xl font-bold" style={{ color: '#8B4513' }}>{initial}</span>
          )}
        </button>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full pointer-events-none"
          style={{ backgroundColor: '#8B4513' }}>
          <Camera size={11} className="text-white" />
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* クロッパーモーダル */}
      {srcUrl && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}>

          {/* タイトルバー */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={handleCancel} className="rounded-full p-2" style={{ color: '#fff' }}>
              <X size={22} />
            </button>
            <p className="text-sm text-white">アバターを調整</p>
            <button onClick={handleConfirm} disabled={uploading}
              className="rounded-full p-2 disabled:opacity-40"
              style={{ color: uploading ? '#aaa' : '#C0392B', backgroundColor: 'rgba(255,255,255,0.12)' }}>
              {uploading
                ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                : <Check size={22} />
              }
            </button>
          </div>

          {/* クロップエリア */}
          <div className="relative flex-1">
            <Cropper
              image={srcUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: 0 },
                cropAreaStyle: { border: '2px solid #C0392B' },
              }}
            />
          </div>

          {/* ズームスライダー */}
          <div className="px-8 pb-10 pt-4 flex items-center gap-3">
            <span className="text-xs text-white opacity-60">小</span>
            <input
              type="range" min={1} max={3} step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-[#C0392B]"
            />
            <span className="text-xs text-white opacity-60">大</span>
          </div>
        </div>
      )}
    </>
  )
}

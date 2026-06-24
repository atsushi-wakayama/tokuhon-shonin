'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, Calendar, NotebookPen, Edit, MapPin } from 'lucide-react'
import type { StampWithMonument } from '@/lib/types/database.types'
import { updateStampMemo } from './actions'

interface Props {
  stamp: StampWithMonument
}

const washibg = [
  'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
].join(', ')

export function StampDetailClient({ stamp }: Props) {
  const router = useRouter()
  const [memo, setMemo] = useState(stamp.memo ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const checkedInDate = new Date(stamp.checked_in_at)
  const dateText = checkedInDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeText = checkedInDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  function handleSave() {
    setError(null)
    const fd = new FormData()
    fd.append('id', stamp.id)
    fd.append('memo', memo)
    startTransition(async () => {
      const result = await updateStampMemo(fd)
      if (result?.error) {
        setError(result.error)
        return
      }
      setIsEditing(false)
    })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0eb' }}>
      <div className="mx-auto max-w-md">

        {/* ヘッダー：和紙テクスチャ */}
        <div className="px-4 pb-5 pt-4" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>
          <button
            onClick={() => router.push('/mypage')}
            className="inline-flex items-center justify-center rounded-full p-2 shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #d4c5b0' }}
          >
            <ArrowLeft size={18} style={{ color: '#4a3a2a' }} />
          </button>

          <h1 className="mt-3 text-2xl leading-snug" style={{ color: '#4a3a2a' }}>
            {stamp.monument?.name}
          </h1>
          {stamp.monument?.address && (
            <p className="mt-1 flex items-start gap-1 text-sm" style={{ color: '#4a3a2a' }}>
              <MapPin size={13} className="mt-0.5 flex-shrink-0" />
              {stamp.monument.address}
            </p>
          )}
        </div>

        {/* ボディ */}
        <div className="px-4 pb-10 pt-4">
          <div className="overflow-hidden rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.92)', border: '1px solid #e8ddd0' }}>

            {/* 写真 */}
            <div className="relative aspect-square w-full bg-stone-100">
              <Image src={stamp.photo_url} alt={stamp.monument?.name ?? ''} fill sizes="(max-width: 448px) 100vw, 448px" className="object-cover" />
            </div>

            {/* チェックイン日時 */}
            <div className="flex gap-3 px-4 py-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: '#f5ede4' }}>
                <Calendar size={15} style={{ color: '#8B4513' }} />
              </div>
              <div>
                <p className="mb-0.5 text-sm font-medium" style={{ color: '#8B4513' }}>チェックインした日</p>
                <p className="text-base leading-relaxed" style={{ color: '#4a3a2a' }}>{dateText}　{timeText}</p>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#e8ddd0', margin: '0 1rem' }} />

            {/* ひとことメモ */}
            <div className="flex gap-3 px-4 py-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: '#f5ede4' }}>
                <NotebookPen size={15} style={{ color: '#8B4513' }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: '#8B4513' }}>ひとことメモ</p>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs"
                      style={{ backgroundColor: '#fdf0e8', color: '#b35c44', border: '1px solid #e8c8b0' }}
                    >
                      <Edit size={12} />
                      編集
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      rows={4}
                      placeholder="このスポットでの思い出など..."
                      className="w-full resize-none rounded-xl px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
                      style={{ border: '1px solid #d4c5b0' }}
                    />
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setIsEditing(false); setMemo(stamp.memo ?? ''); setError(null) }}
                        className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }}
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white disabled:opacity-40"
                        style={{ backgroundColor: '#b35c44' }}
                      >
                        {isPending ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" /> 保存中...
                          </span>
                        ) : '保存する'}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-base leading-relaxed" style={{ color: memo ? '#4a3a2a' : '#9a8a7a' }}>
                    {memo || 'まだメモがありません'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {stamp.monument?.id && (
            <Link
              href={`/monuments/${stamp.monument.id}`}
              className="mt-4 flex w-full items-center justify-center rounded-xl py-3 text-base font-medium text-white"
              style={{ backgroundColor: '#b35c44' }}
            >
              スポット詳細を見る
            </Link>
          )}

          <div className="pb-8" />
        </div>
      </div>
    </div>
  )
}

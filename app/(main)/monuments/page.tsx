'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { MonumentCard } from '@/components/monument/MonumentCard'
import { useMonuments } from '@/lib/hooks/useMonuments'

const washibg = [
  'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
].join(', ')

const AREAS = [
  { id: undefined, label: 'すべて' },
  { id: 1, label: '和歌山県' },
  { id: 3, label: '近畿・中部' },
  { id: 2, label: '関東・東京' },
  { id: 4, label: '東北' },
  { id: 5, label: 'その他' },
]

export default function MonumentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(
    searchParams.get('area') ? Number(searchParams.get('area')) : undefined
  )
  const { monuments, loading } = useMonuments()

  function syncParams(q: string, area: number | undefined) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (area !== undefined) params.set('area', String(area))
    router.replace(`/monuments${params.toString() ? `?${params.toString()}` : ''}`)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    syncParams(value, selectedAreaId)
  }

  function handleAreaChange(area: number | undefined) {
    setSelectedAreaId(area)
    syncParams(query, area)
  }

  const filtered = monuments.filter((m) => {
    const matchArea = selectedAreaId === undefined || m.area_id === selectedAreaId
    const matchQuery = query === '' || m.name.includes(query) || (m.address ?? '').includes(query)
    return matchArea && matchQuery
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0eb' }}>
    <div className="mx-auto max-w-md">
      {/* ヘッダー：和紙テクスチャ */}
      <div className="px-4 pb-5 pt-4" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>
        <h1 className="text-2xl font-medium leading-snug" style={{ color: '#4a3a2a' }}>名号碑スポット一覧</h1>
      </div>

      <div className="px-4 pt-6">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input type="search" placeholder="名称・所在地で検索..." value={query} onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }} />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {AREAS.map(({ id, label }) => (
          <button key={String(id)} onClick={() => handleAreaChange(id)}
            className="flex-shrink-0 rounded-full px-4 py-2 text-base font-normal transition-colors"
            style={selectedAreaId === id
              ? { backgroundColor: '#b35c44', color: '#ffffff' }
              : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3 pb-4">
        {loading ? (
          <p className="py-12 text-center text-base" style={{ color: '#5a5a5a' }}>読み込み中...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-base" style={{ color: '#423629', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '0.75rem', padding: '3rem 1rem' }}>該当するスポットがありません</p>
        ) : (
          filtered.map((m) => <MonumentCard key={m.id} monument={m} />)
        )}
      </div>
      </div>
    </div>

    {/* 申請ボタン（右下固定） */}
    <Link
      href="/monuments/submit?from=monuments"
      className="fixed z-20 flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium text-white shadow-lg"
      style={{
        bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 1rem)',
        right: '1rem',
        backgroundColor: '#b35c44',
      }}
    >
      <Plus size={16} />
      スポットを申請
    </Link>
    </div>
  )
}

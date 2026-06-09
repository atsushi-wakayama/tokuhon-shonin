'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { MonumentCard } from '@/components/monument/MonumentCard'
import { useMonuments } from '@/lib/hooks/useMonuments'

const AREAS = [
  { id: undefined, label: 'すべて' },
  { id: 1, label: '和歌山県' },
  { id: 3, label: '近畿・中部' },
  { id: 2, label: '関東・東京' },
  { id: 4, label: '東北' },
]

export default function MonumentsPage() {
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(undefined)
  const [query, setQuery] = useState('')
  const { monuments, loading } = useMonuments()

  const filtered = monuments.filter((m) => {
    const matchArea = selectedAreaId === undefined || m.area_id === selectedAreaId
    const matchQuery = query === '' || m.name.includes(query) || m.prefecture.includes(query)
    return matchArea && matchQuery
  })

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/bg-pattern.png)', backgroundSize: '320px', backgroundRepeat: 'repeat', backgroundColor: '#f5f0eb' }}>
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-4 inline-block rounded-xl px-4 py-2 text-xl" style={{ color: '#423629', backgroundColor: 'rgba(255,255,255,0.8)' }}>名号碑スポット一覧</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input type="search" placeholder="名称・都道府県で検索..." value={query} onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl py-3 pl-10 pr-4 text-base outline-none focus:ring-1 focus:ring-[#b35c44]"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }} />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {AREAS.map(({ id, label }) => (
          <button key={String(id)} onClick={() => setSelectedAreaId(id)}
            className="flex-shrink-0 rounded-full px-4 py-2 text-base font-medium transition-colors"
            style={selectedAreaId === id
              ? { backgroundColor: '#b35c44', color: '#ffffff' }
              : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="py-12 text-center text-base" style={{ color: '#5a5a5a' }}>読み込み中...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-base" style={{ color: '#423629', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '0.75rem', padding: '3rem 1rem' }}>該当するスポットがありません</p>
        ) : (
          filtered.map((m) => <MonumentCard key={m.id} monument={m} />)
        )}
      </div>

      <Link
        href="/monuments/submit?from=monuments"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#b35c44', border: '1px solid #b35c44' }}
      >
        <Plus size={16} />
        新しいスポットを申請する
      </Link>
    </div>
    </div>
  )
}

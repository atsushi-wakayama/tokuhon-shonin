'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { MonumentCard } from '@/components/monument/MonumentCard'
import { MOCK_MONUMENTS } from '@/lib/mock/monuments'

const AREAS = [
  { id: undefined, label: 'すべて' },
  { id: 1, label: '和歌山県' },
  { id: 2, label: '関東・東京' },
  { id: 3, label: '中部・近畿' },
  { id: 4, label: '東北' },
]

export default function MonumentsPage() {
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(undefined)
  const [query, setQuery] = useState('')

  const filtered = MOCK_MONUMENTS.filter((m) => {
    const matchArea = selectedAreaId === undefined || m.area_id === selectedAreaId
    const matchQuery = query === '' || m.name.includes(query) || m.prefecture.includes(query)
    return matchArea && matchQuery
  })

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-4 text-xl font-bold text-stone-800">名号碑スポット一覧</h1>

      {/* 検索バー */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        <input
          type="search"
          placeholder="名称・都道府県で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
        />
      </div>

      {/* エリアフィルター */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {AREAS.map(({ id, label }) => (
          <button
            key={String(id)}
            onClick={() => setSelectedAreaId(id)}
            className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedAreaId === id
                ? 'bg-amber-700 text-white'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* リスト */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-stone-400">該当するスポットがありません</p>
        ) : (
          filtered.map((m) => <MonumentCard key={m.id} monument={m} />)
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Search, Edit, Check, X, Trash2, Plus } from 'lucide-react'
import { approveMonument, rejectMonument, deleteMonument } from './actions'

const washibg = [
  'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
  'repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(160,130,100,0.12) 19px, rgba(160,130,100,0.12) 20px)',
].join(', ')

type Monument = {
  id: string
  name: string
  prefecture: string
  address: string | null
  area_id: number | null
  description: string | null
  access_info: string | null
  image_urls: string[]
  is_verified: boolean
  status: string
  submitted_by: string | null
}

type PendingMonument = {
  id: string
  name: string
  prefecture: string
  address: string | null
  description: string | null
  submitted_by: string | null
  created_at: string
}

const AREAS = [
  { id: null, label: 'すべて' },
  { id: 1, label: '和歌山県' },
  { id: 3, label: '近畿・中部' },
  { id: 2, label: '関東・東京' },
  { id: 4, label: '東北' },
  { id: 5, label: 'その他' },
]

function hasEmptyFields(m: Monument) {
  return !m.address || !m.description || !m.access_info || m.area_id === null
}

export function AdminClient({
  allMonuments,
  pendingMonuments,
  monumentsError,
  pendingError,
}: {
  allMonuments: Monument[]
  pendingMonuments: PendingMonument[]
  monumentsError: boolean
  pendingError: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<'spots' | 'pending'>(
    searchParams.get('tab') === 'pending' ? 'pending' : 'spots'
  )
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [areaId, setAreaId] = useState<number | null>(
    searchParams.get('area') ? Number(searchParams.get('area')) : null
  )
  const [onlyEmpty, setOnlyEmpty] = useState(searchParams.get('empty') === '1')

  function syncParams(next: {
    tab?: 'spots' | 'pending'
    q?: string
    area?: number | null
    empty?: boolean
  }) {
    const params = new URLSearchParams()
    const t = next.tab ?? tab
    const q = next.q ?? query
    const area = next.area !== undefined ? next.area : areaId
    const empty = next.empty ?? onlyEmpty

    if (t === 'pending') params.set('tab', 'pending')
    if (q) params.set('q', q)
    if (area !== null) params.set('area', String(area))
    if (empty) params.set('empty', '1')

    router.replace(`/admin${params.toString() ? `?${params.toString()}` : ''}`)
  }

  function handleTabChange(t: 'spots' | 'pending') {
    setTab(t)
    syncParams({ tab: t })
  }

  function handleQueryChange(q: string) {
    setQuery(q)
    syncParams({ q })
  }

  function handleAreaChange(area: number | null) {
    setAreaId(area)
    syncParams({ area })
  }

  function handleOnlyEmptyChange(empty: boolean) {
    setOnlyEmpty(empty)
    syncParams({ empty })
  }
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPendingDelete, startDeleteTransition] = useTransition()

  const filtered = allMonuments.filter((m) => {
    if (areaId !== null && m.area_id !== areaId) return false
    if (query && !m.name.includes(query) && !(m.address ?? '').includes(query)) return false
    if (onlyEmpty && !hasEmptyFields(m)) return false
    return true
  })

  return (
    <>
      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white px-6 py-6 text-center shadow-lg">
            <p className="mb-2 text-base font-medium" style={{ color: '#3a2a1a' }}>
              このスポットを削除しますか？
            </p>
            <p className="mb-5 text-sm font-medium" style={{ color: '#b35c44' }}>
              「{deleteTarget.name}」
            </p>
            <p className="mb-5 text-xs" style={{ color: '#5a5a5a' }}>
              この操作は取り消せません。
            </p>
            {deleteError && (
              <p className="mb-3 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: '#fdf0e8', color: '#c0392b', border: '1px solid #e8c8b0' }}>
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null) }}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }}
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={isPendingDelete}
                onClick={() => {
                  setDeleteError(null)
                  const id = deleteTarget.id
                  startDeleteTransition(async () => {
                    const fd = new FormData()
                    fd.append('id', id)
                    const result = await deleteMonument(fd)
                    if (result?.error) {
                      setDeleteError(result.error)
                    } else {
                      setDeleteTarget(null)
                    }
                  })
                }}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: isPendingDelete ? '#e57373' : '#c0392b' }}
              >
                {isPendingDelete ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

    <div
      className="min-h-screen"
      style={{ backgroundColor: '#f5f0eb' }}
    >
      <div className="mx-auto max-w-md">
        {/* ヘッダー：和紙テクスチャ */}
        <div className="px-4 pb-5 pt-4" style={{ backgroundColor: '#faf7f0', backgroundImage: washibg }}>
          <Link href="/mypage" className="inline-flex items-center justify-center rounded-full p-2 shadow-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid #d4c5b0' }}>
            <ArrowLeft size={18} style={{ color: '#4a3a2a' }} />
          </Link>
          <h1 className="mt-3 mb-4 text-2xl font-medium leading-snug" style={{ color: '#3a2a1a' }}>
            管理ページ
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleTabChange('spots')}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={
                tab === 'spots'
                  ? { backgroundColor: '#b35c44', color: '#ffffff' }
                  : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }
              }
            >
              スポット管理
            </button>
            <button
              onClick={() => handleTabChange('pending')}
              className="relative flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={
                tab === 'pending'
                  ? { backgroundColor: '#b35c44', color: '#ffffff' }
                  : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }
              }
            >
              承認待ち
              {pendingMonuments.length > 0 && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-6 min-w-[24px] items-center justify-center rounded-full px-1 text-sm font-bold"
                  style={{ backgroundColor: '#e04040', color: '#fff' }}
                >
                  {pendingMonuments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="px-4 pt-4">
          {tab === 'spots' ? (
            <>
              {monumentsError && (
                <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#fdf0e8', color: '#c05c44', border: '1px solid #e8c8b0' }}>
                  データの取得に失敗しました
                </div>
              )}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="search"
                  placeholder="名称・所在地で検索..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="w-full rounded-xl py-3 pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
                />
              </div>

              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {AREAS.map((a) => (
                  <button
                    key={String(a.id)}
                    onClick={() => handleAreaChange(a.id)}
                    className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                    style={
                      areaId === a.id
                        ? { backgroundColor: '#b35c44', color: '#ffffff' }
                        : { backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }
                    }
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <label className="mb-4 inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyEmpty}
                  onChange={(e) => handleOnlyEmptyChange(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium" style={{ color: '#423629' }}>
                  未入力項目がある碑だけ表示
                </span>
              </label>

              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: '#5a5a5a' }}>
                  スポット {filtered.length}件
                </p>
                <Link
                  href="/admin/monuments/new"
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                  style={{ backgroundColor: '#b35c44' }}
                >
                  <Plus size={12} />
                  新規追加
                </Link>
              </div>

              <div className="space-y-2 pb-8">
                {filtered.length === 0 && !monumentsError && (
                  <div className="rounded-xl py-12 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                    <p className="text-sm" style={{ color: '#5a5a5a' }}>該当するスポットがありません</p>
                  </div>
                )}
                {filtered.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e8ddd0' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium" style={{ color: '#3a2a1a' }}>
                        {m.name}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: '#5a5a5a' }}>
                        {m.address ?? m.prefecture}
                      </p>
                      {m.status === 'pending' && (
                        <span
                          className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' }}
                        >
                          承認待ち
                        </span>
                      )}
                      {hasEmptyFields(m) && (
                        <p className="mt-0.5 text-xs" style={{ color: '#c05c44' }}>
                          未入力項目あり
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex flex-shrink-0 gap-2">
                      <Link
                        href={`/admin/monuments/${m.id}/edit`}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
                        style={{ backgroundColor: '#fdf0e8', color: '#b35c44', border: '1px solid #e8c8b0' }}
                      >
                        <Edit size={12} />
                        編集
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: m.id, name: m.name })}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
                        style={{ backgroundColor: '#fdf0e8', color: '#c0392b', border: '1px solid #e8c8b0' }}
                      >
                        <Trash2 size={12} />
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3 pb-8">
              {pendingError && (
                <div className="mb-1 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#fdf0e8', color: '#c05c44', border: '1px solid #e8c8b0' }}>
                  データの取得に失敗しました
                </div>
              )}
              {!pendingError && pendingMonuments.length === 0 ? (
                <div className="rounded-xl py-12 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  <p className="text-sm" style={{ color: '#5a5a5a' }}>
                    承認待ちの申請はありません
                  </p>
                </div>
              ) : (
                pendingMonuments.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl px-4 py-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e8ddd0' }}
                  >
                    <p className="mb-1 text-sm font-medium" style={{ color: '#3a2a1a' }}>
                      {m.name}
                    </p>
                    <p className="mb-1 text-xs" style={{ color: '#5a5a5a' }}>
                      {m.prefecture} {m.address ?? ''}
                    </p>
                    {m.description && (
                      <p className="mb-2 line-clamp-2 text-xs" style={{ color: '#5a5a5a' }}>
                        {m.description}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <form action={approveMonument} className="flex-1">
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium"
                          style={{ backgroundColor: '#4a7c59', color: '#ffffff' }}
                        >
                          <Check size={14} />
                          承認
                        </button>
                      </form>
                      <form action={rejectMonument} className="flex-1">
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-sm font-medium"
                          style={{ backgroundColor: '#fdf0e8', color: '#b35c44', border: '1px solid #e8c8b0' }}
                        >
                          <X size={14} />
                          却下
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-stone-50">
      <div className="text-center">
        <p className="text-6xl font-light mb-4" style={{ color: '#d4c5b0' }}>404</p>
        <h1 className="text-xl mb-2" style={{ color: '#423629' }}>ページが見つかりません</h1>
        <p className="text-sm mb-8" style={{ color: '#8B4513' }}>
          お探しのスポットは存在しないか、削除された可能性があります
        </p>
        <Link
          href="/monuments"
          className="inline-block rounded-xl px-6 py-3 text-sm text-white"
          style={{ backgroundColor: '#b35c44' }}
        >
          スポット一覧に戻る
        </Link>
      </div>
    </main>
  )
}

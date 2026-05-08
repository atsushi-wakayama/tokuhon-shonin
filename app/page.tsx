import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-900 to-stone-900 px-6 text-white">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs tracking-[0.3em] text-amber-300">江戸時代 念仏行者</p>
        <h1 className="text-2xl font-bold tracking-widest">徳本上人</h1>
        <p className="mt-1 text-lg tracking-widest text-amber-200">名号碑めぐり</p>
      </div>

      <div className="mb-10 text-center">
        <p className="text-4xl font-bold tracking-[0.5em] text-amber-100">南無阿弥陀仏</p>
        <p className="mt-4 text-xs leading-relaxed text-stone-400">
          全国1,500基以上の名号碑を巡り<br />デジタルスタンプを集めよう
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/login"
          className="block w-full rounded-xl bg-amber-700 py-3.5 text-center font-bold tracking-wide shadow-lg"
        >
          はじめる
        </Link>
        <Link
          href="/map"
          className="block w-full rounded-xl border border-stone-600 py-3.5 text-center text-sm text-stone-400"
        >
          ログインせずに地図を見る
        </Link>
      </div>
    </main>
  )
}

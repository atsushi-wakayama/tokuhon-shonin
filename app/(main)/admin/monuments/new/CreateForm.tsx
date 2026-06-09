'use client'

import { useActionState, useState } from 'react'

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createMonument } from './actions'

type Area = {
  id: number
  name: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium" style={{ color: '#423629' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function CreateForm({ areas }: { areas: Area[] }) {
  const router = useRouter()
  const [state, formAction] = useActionState(createMonument, null)
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget)
    const hasValue =
      !!(fd.get('name') as string) ||
      !!(fd.get('prefecture') as string) ||
      !!(fd.get('address') as string) ||
      !!(fd.get('description') as string) ||
      !!(fd.get('access_info') as string)
    setIsDirty(hasValue)
  }

  const preventEnterSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.preventDefault()
  }

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedDialog(true)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/bg-pattern.png)',
        backgroundSize: '320px',
        backgroundRepeat: 'repeat',
        backgroundColor: '#f5f0eb',
      }}
    >
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white px-6 py-6 text-center shadow-lg">
            <p className="mb-5 text-base font-medium" style={{ color: '#3a2a1a' }}>
              入力内容が保存されていません。破棄して戻りますか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnsavedDialog(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#423629', border: '1px solid #d4c5b0' }}
              >
                入力に戻る
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: '#b35c44' }}
              >
                破棄して戻る
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md">
        <div className="px-4 pt-5 pb-4" style={{ backgroundColor: '#faf7f0' }}>
          <button
            onClick={handleBack}
            className="mb-3 flex items-center gap-1 text-sm"
            style={{ color: '#b35c44' }}
          >
            <ChevronLeft size={16} />
            管理ページに戻る
          </button>
          <h1 className="text-lg font-medium" style={{ color: '#3a2a1a' }}>
            スポット新規追加
          </h1>
        </div>

        <form action={formAction} onChange={handleFormChange} className="space-y-4 px-4 pt-4 pb-8">
          {state?.error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: '#fdf0e8', color: '#c05c44', border: '1px solid #e8c8b0' }}
            >
              {state.error}
            </div>
          )}

          <Field label="碑の名称 *">
            <input
              name="name"
              required
              onKeyDown={preventEnterSubmit}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="都道府県 *">
            <select
              name="prefecture"
              defaultValue=""
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            >
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="住所">
            <input
              name="address"
              onKeyDown={preventEnterSubmit}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="エリア">
            <select
              name="area_id"
              defaultValue=""
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            >
              <option value="">未設定</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="解説テキスト">
            <textarea
              name="description"
              rows={4}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="アクセス情報">
            <textarea
              name="access_info"
              rows={3}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            />
          </Field>

          <Field label="現地確認済み">
            <select
              name="is_verified"
              defaultValue="false"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#b35c44]"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #d4c5b0' }}
            >
              <option value="false">未確認</option>
              <option value="true">確認済み</option>
            </select>
          </Field>

          <button
            type="submit"
            className="w-full rounded-xl py-3.5 text-base font-medium text-white"
            style={{ backgroundColor: '#b35c44' }}
          >
            追加する
          </button>
        </form>
      </div>
    </div>
  )
}

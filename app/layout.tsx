import type { Metadata, Viewport } from 'next'
import { Zen_Kaku_Gothic_New } from 'next/font/google'
import './globals.css'

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '徳本上人 名号碑めぐり',
  description: '全国の徳本上人 名号碑をめぐるデジタルスタンプラリー',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '名号碑めぐり',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#92400e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${zenKakuGothicNew.className} bg-stone-50 antialiased`}>{children}</body>
    </html>
  )
}

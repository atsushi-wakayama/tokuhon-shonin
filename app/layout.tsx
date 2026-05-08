import type { Metadata, Viewport } from 'next'
import { Noto_Serif_JP } from 'next/font/google'
import './globals.css'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-serif',
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
  themeColor: '#92400e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSerifJP.variable}>
      <body className="bg-stone-50 font-serif antialiased">{children}</body>
    </html>
  )
}

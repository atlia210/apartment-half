import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import { LanguageProvider } from '@/contexts/LanguageContext'
import WelcomeGate from '@/components/WelcomeGate'
import './globals.css'

const mono = Geist_Mono({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'アパート1/2',
  description: '無限の二分岐アパート',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${mono.className} h-full`}>
      <body className="h-full bg-white text-black">
        <LanguageProvider>
          <WelcomeGate />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

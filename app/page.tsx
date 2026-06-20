'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import LangToggle from '@/components/LangToggle'

export default function Home() {
  const { t } = useLang()

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-16 bg-white">
      {/* Lang toggle — top right */}
      <div className="absolute top-4 right-4">
        <LangToggle />
      </div>

      <div className="text-center space-y-3">
        <p className="text-xs tracking-[0.5em] text-gray-400">APARTMENT</p>
        <h1 className="text-6xl font-bold tracking-widest">1/2</h1>
        <p className="text-xs text-gray-300 tracking-widest">{t.tagline}</p>
      </div>

      <p className="text-xs text-gray-400 tracking-[0.3em]">— {t.chooseDoor} —</p>

      <div className="flex gap-16">
        <Link href="/room/1" className="group flex flex-col items-center gap-3">
          <div className="w-20 h-36 border-2 border-black relative flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-200">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-current group-hover:border-white" />
            <span className="text-2xl font-bold">1</span>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-black transition-colors tracking-widest">
            → room 1
          </span>
        </Link>

        <Link href="/room/2" className="group flex flex-col items-center gap-3">
          <div className="w-20 h-36 border-2 border-black relative flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-200">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-current group-hover:border-white" />
            <span className="text-2xl font-bold">2</span>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-black transition-colors tracking-widest">
            → room 2
          </span>
        </Link>
      </div>
    </div>
  )
}

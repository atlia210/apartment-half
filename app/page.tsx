'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import LangToggle from '@/components/LangToggle'
import SettingsButton from '@/components/SettingsButton'

const VISITOR_KEY = 'apartment-half-visitor-no'

export default function Home() {
  const { t } = useLang()
  const router = useRouter()
  const [visitorNo, setVisitorNo] = useState<number | null>(null)
  const [residentCount, setResidentCount] = useState<number | null>(null)

  // キーボード操作: ← で room 1、→ で room 2
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        router.push('/room/1')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        router.push('/room/2')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  // 現在の入居者数（rooms テーブルの行数）を取得
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
      if (!cancelled && count != null) setResidentCount(count)
    })()
    return () => { cancelled = true }
  }, [])

  // サイト全体の訪問者数をカウントし「あなたは N 人目」を表示する。
  // 番号は localStorage に保存し、再訪問時も同じ番号を見せる（ブラウザ単位で1カウント）。
  useEffect(() => {
    const stored = localStorage.getItem(VISITOR_KEY)
    if (stored && /^\d+$/.test(stored)) {
      setVisitorNo(Number(stored))
      return
    }
    // 'pending' は登録処理が進行中（Strict Mode の二重実行による二重カウントを防ぐ）
    if (stored === 'pending') return
    localStorage.setItem(VISITOR_KEY, 'pending')

    ;(async () => {
      try {
        const { error } = await supabase.from('site_visits').insert({})
        if (error) {
          localStorage.removeItem(VISITOR_KEY)
          return
        }
        const { count } = await supabase
          .from('site_visits')
          .select('*', { count: 'exact', head: true })
        if (count != null) {
          localStorage.setItem(VISITOR_KEY, String(count))
          setVisitorNo(count)
        } else {
          localStorage.removeItem(VISITOR_KEY)
        }
      } catch {
        localStorage.removeItem(VISITOR_KEY)
      }
    })()
  }, [])

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-16 bg-white">
      {/* Settings + Lang toggle — top right */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <SettingsButton />
        <LangToggle />
      </div>

      <div className="text-center space-y-3">
        <p className="text-xs tracking-[0.5em] text-gray-400">APARTMENT</p>
        <h1 className="text-6xl font-bold tracking-widest">1/2</h1>
        <p className="text-xs text-gray-300 tracking-widest">{t.tagline}</p>
        {residentCount != null && (
          <p className="text-xs text-gray-300 tracking-widest pt-1">{t.residentCount(residentCount)}</p>
        )}
        {visitorNo != null && (
          <p className="text-xs text-gray-300 tracking-widest">{t.visitorNumber(visitorNo)}</p>
        )}
      </div>

      <p className="text-xs text-gray-400 tracking-[0.3em]">— {t.chooseDoor} —</p>

      <div className="flex gap-16">
        <Link href="/room/1" className="group flex flex-col items-center gap-3">
          <div className="w-20 h-36 border-2 border-black relative flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-200">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-current group-hover:border-white" />
            <span className="text-2xl font-bold">1</span>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-black transition-colors tracking-widest">
            ← room 1
          </span>
        </Link>

        <Link href="/room/2" className="group flex flex-col items-center gap-3">
          <div className="w-20 h-36 border-2 border-black relative flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-200">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-current group-hover:border-white" />
            <span className="text-2xl font-bold">2</span>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-black transition-colors tracking-widest">
            room 2 →
          </span>
        </Link>
      </div>
    </div>
  )
}

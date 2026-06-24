'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { getProfile, saveProfile } from '@/lib/profile'
import LangToggle from './LangToggle'

const ONBOARDED_KEY = 'apartment-half-onboarded'

export default function WelcomeGate() {
  const { t } = useLang()
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')

  // マウント後に初回訪問かどうかを判定（SSR/ハイドレーション不一致を避ける）
  useEffect(() => {
    if (!localStorage.getItem(ONBOARDED_KEY)) setShow(true)
  }, [])

  if (!show) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return // 未入力では閉じられない
    saveProfile({ ...getProfile(), resident_name: trimmed })
    localStorage.setItem(ONBOARDED_KEY, 'true')
    setShow(false)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[60] p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div className="bg-white w-full max-w-sm border border-black">
        <div className="px-4 py-3 border-b border-black flex items-center justify-between gap-3">
          <h2 className="text-xs font-bold tracking-[0.2em]">{t.welcomeTitle}</h2>
          <LangToggle />
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-gray-500 tracking-wide leading-relaxed">{t.welcomeNamePrompt}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
            placeholder={t.namePlaceholder}
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-black text-white py-2 text-xs tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t.welcomeNameButton}
          </button>
        </form>
      </div>
    </div>
  )
}

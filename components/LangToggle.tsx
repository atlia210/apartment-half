'use client'

import { useLang } from '@/contexts/LanguageContext'
import type { Lang } from '@/lib/i18n'

const LANGS: { value: Lang; label: string }[] = [
  { value: 'jp', label: 'JP' },
  { value: 'en', label: 'EN' },
]

export default function LangToggle() {
  const { lang, setLang } = useLang()

  return (
    <div className="flex border border-black/20 divide-x divide-black/20">
      {LANGS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={`px-2 py-0.5 text-xs tracking-widest transition-colors ${
            lang === value
              ? 'bg-black text-white'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

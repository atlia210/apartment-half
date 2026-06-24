'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/contexts/LanguageContext'
import { getProfile, saveProfile, emptyProfile } from '@/lib/profile'
import type { RoomFormData } from '@/lib/types'

export default function SettingsButton() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t.settings}
        title={t.settings}
        className="text-gray-400 hover:text-black transition-colors text-base leading-none"
      >
        ⚙
      </button>
      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  )
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  const [form, setForm] = useState<RoomFormData>(emptyProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(getProfile())
  }, [])

  const [error, setError] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.resident_name.trim()) {
      setError(t.nameRequired)
      return
    }
    setError('')
    saveProfile(form)
    setSaved(true)
    setTimeout(onClose, 700)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-md border border-black">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black">
          <h2 className="text-xs font-bold tracking-[0.2em]">{t.settingsTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors text-xs leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-4">
          <p className="text-xs text-gray-400 tracking-wide leading-relaxed">{t.settingsDescription}</p>

          <div>
            <label className="text-xs text-gray-400 tracking-widest block mb-1">{t.nameLabel}</label>
            <input
              type="text"
              value={form.resident_name}
              onChange={(e) => setForm({ ...form, resident_name: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder={t.namePlaceholder}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 tracking-widest block mb-1">{t.twitterLabel}</label>
            <input
              type="text"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 tracking-widest block mb-1">{t.instagramLabel}</label>
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 tracking-widest block mb-1">{t.bioLabel}</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black resize-none"
              rows={3}
              placeholder={t.bioPlaceholder}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 tracking-widest block mb-1">{t.roomColorLabel}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.bg_color}
                onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                className="w-10 h-10 border border-gray-300 cursor-pointer p-0.5"
              />
              <span className="text-xs text-gray-400 tracking-widest">{form.bg_color}</span>
              <div className="w-10 h-10 border border-gray-200" style={{ backgroundColor: form.bg_color }} />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 text-xs tracking-widest hover:bg-gray-800 transition-colors"
            >
              {t.saveButton}
            </button>
            {saved && <span className="text-xs text-gray-400 tracking-widest">{t.savedMessage}</span>}
          </div>
        </form>
      </div>
    </div>
  )
}

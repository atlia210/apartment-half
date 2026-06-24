'use client'

import { relativeTime } from '@/lib/i18n'
import { useLang } from '@/contexts/LanguageContext'
import type { RoomLog } from '@/lib/types'

type Props = {
  logs: RoomLog[]
  onClose: () => void
}

export default function LogHistoryModal({ logs, onClose }: Props) {
  const { t, lang } = useLang()

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-sm border border-black">
        <div className="px-5 py-4 border-b border-black">
          <h2 className="text-xs font-bold tracking-[0.2em]">{t.historyTitle}</h2>
        </div>

        <div className="px-5 py-4 max-h-80 overflow-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 tracking-widest">{t.historyEmpty}</p>
          ) : (
            <ul className="divide-y divide-black/10">
              {logs.map((log) => {
                const label =
                  log.event_type === 'checkin'
                    ? log.visitor_name
                      ? `${t.historyCheckin}: ${log.visitor_name}`
                      : t.historyCheckin
                    : log.event_type === 'checkout'
                      ? log.visitor_name
                        ? `${t.historyCheckout}: ${log.visitor_name}`
                        : t.historyCheckout
                      : log.visitor_name
                        ? t.historyVisitBy(log.visitor_name)
                        : t.historyVisit
                return (
                  <li key={log.id} className="flex items-baseline justify-between gap-3 py-2.5">
                    <span className="text-sm text-gray-700 truncate">{label}</span>
                    <span className="text-xs text-gray-400 tracking-widest whitespace-nowrap shrink-0">
                      {relativeTime(log.created_at, lang)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full border border-gray-300 py-2 text-xs tracking-widest hover:border-black transition-colors"
          >
            {t.historyClose}
          </button>
        </div>
      </div>
    </div>
  )
}

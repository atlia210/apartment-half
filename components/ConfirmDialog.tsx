'use client'

type Props = {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  danger?: boolean
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}: Props) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white w-full max-w-sm border border-black">
        <div className="px-5 py-4 border-b border-black">
          <h2 className="text-xs font-bold tracking-[0.2em]">{title}</h2>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed text-gray-600">{message}</p>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-300 py-2 text-xs tracking-widest hover:border-black transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 text-xs tracking-widest transition-colors disabled:opacity-50 ${
              danger
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

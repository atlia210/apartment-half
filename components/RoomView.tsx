'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'
import { relativeTime } from '@/lib/i18n'
import { getProfile } from '@/lib/profile'
import type { Room, RoomLog, RoomFormData } from '@/lib/types'
import CheckInModal from './CheckInModal'
import ConfirmDialog from './ConfirmDialog'
import LogHistoryModal from './LogHistoryModal'
import LangToggle from './LangToggle'
import SettingsButton from './SettingsButton'

type Props = {
  roomId: string
}

const RESIDENT_KEY = 'apartment-half-resident'
const ownerKey = (id: string) => `apartment-half-owner:${id}`

// このページ読み込み中に visit を insert 中/済みの部屋キー（Strict Mode の二重実行による重複 insert を防ぐ）。
// localStorage に 'pending' を残すと処理中断時に詰まるため、ガードはメモリ（モジュールスコープ）で持つ。
const insertingRooms = new Set<string>()

export default function RoomView({ roomId }: Props) {
  const { t, lang } = useLang()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [residentRoomId, setResidentRoomId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'checkin' | 'edit'>('checkin')
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [logs, setLogs] = useState<RoomLog[]>([])
  const [myLogId, setMyLogId] = useState<number | null>(null)
  const [logsLoaded, setLogsLoaded] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const parentId = roomId.length > 1 ? roomId.slice(0, -1) : null
  const leftDoorId = roomId + '1'
  const rightDoorId = roomId + '2'

  // localStorage からオーナー情報・居住中の部屋を読み込む
  useEffect(() => {
    setIsOwner(localStorage.getItem(ownerKey(roomId)) === 'true')
    setResidentRoomId(localStorage.getItem(RESIDENT_KEY))

    const onStorage = (e: StorageEvent) => {
      if (e.key === RESIDENT_KEY) setResidentRoomId(e.newValue)
      if (e.key === ownerKey(roomId)) setIsOwner(e.newValue === 'true')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [roomId])

  // 訪問ログの記録とフェッチ
  // 入室時に自分の visit を記録（初回 insert / 再訪問は時刻 update）するが、
  // 表示では myLogId で自分の行を除外し「前の訪問者」の時刻を見せる。
  // ゲートは localStorage に保存し、タブを閉じても時間が経っても再カウントされないようにする。
  useEffect(() => {
    let cancelled = false
    const visitedKey = `apartment-half-visited:${roomId}`
    setLogsLoaded(false)

    const run = async () => {
      try {
        const visited = localStorage.getItem(visitedKey)
        if (visited && /^\d+$/.test(visited)) {
          // 再訪問: 自分の行の created_at を「今」に更新（人数は増やさない）。
          // id は global 一意なので別部屋に残っても誤除外せず、cancelled ガード不要。
          const id = Number(visited)
          setMyLogId(id)
          await supabase.from('room_logs').update({ created_at: new Date().toISOString() }).eq('id', id)
        } else if (!visited && !insertingRooms.has(visitedKey)) {
          // 初回訪問: visit 行を insert。insertingRooms で Strict Mode の二重 insert を防ぐ。
          insertingRooms.add(visitedKey)
          const name = getProfile().resident_name.trim()
          const { data: inserted, error } = await supabase
            .from('room_logs')
            .insert({ room_id: roomId, event_type: 'visit', visitor_name: name || null })
            .select('id')
            .single()
          if (error) {
            // insert 失敗時はガードを外して次回アクセスで再試行
            insertingRooms.delete(visitedKey)
          } else if (inserted) {
            const id = (inserted as { id: number }).id
            localStorage.setItem(visitedKey, String(id))
            setMyLogId(id)
          }
        }
        // insert 処理中（insertingRooms 登録済み・localStorage 未確定）の場合は何もしない（myLogId 据え置き）。

        // 表示用に全ログを取得（自分の行は表示側で除外）
        const { data } = await supabase
          .from('room_logs')
          .select('id, event_type, visitor_name, created_at')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(200)
        if (!cancelled && data) {
          setLogs(data as RoomLog[])
          setLogsLoaded(true)
        }
      } catch {
        // Supabase 未接続時は無視
      }
    }

    run()
    return () => { cancelled = true }
  }, [roomId])

  // クライアントサイドで初期データをフェッチ（空室を先に表示してバックグラウンド更新）
  useEffect(() => {
    setRoom(null) // まず空室として即時表示
    const controller = new AbortController()

    supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .abortSignal(controller.signal)
      .single()
      .then(({ data, error }) => {
        if (error) {
          // AbortError: ナビゲーションによるキャンセル（正常）
          if (error.message?.includes('AbortError')) return
          // PGRST116: row not found = 空室（正常）
          if (error.code !== 'PGRST116') {
            console.error('[fetch] error:', error.code || 'network', error.message)
          }
        }
        setRoom(data ?? null)
      })

    return () => controller.abort()
  }, [roomId])

  // リアルタイム購読
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') setRoom(null)
          else setRoom(payload.new as Room)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  // キーボード操作: ←→↓ で扉移動、↑ で入居ボタン
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // モーダル表示中・入力中は無効
      if (showModal || showCheckoutConfirm || showHistory) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          router.push(`/room/${leftDoorId}`)
          break
        case 'ArrowRight':
          e.preventDefault()
          router.push(`/room/${rightDoorId}`)
          break
        case 'ArrowDown':
          e.preventDefault()
          router.push(parentId ? `/room/${parentId}` : '/')
          break
        case 'ArrowUp':
          // 空室で、かつ他の部屋に入居していない場合のみ入居モーダルを開く
          if (!room && !(residentRoomId !== null && residentRoomId !== roomId)) {
            e.preventDefault()
            setModalMode('checkin')
            setShowModal(true)
          }
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router, roomId, leftDoorId, rightDoorId, parentId, room, residentRoomId, showModal, showCheckoutConfirm, showHistory])

  // 入居・編集処理
  const handleSubmit = useCallback(
    async (data: RoomFormData) => {
      if (modalMode === 'edit') {
        if (!isOwner) throw new Error('no permission')
        const { error } = await supabase.from('rooms').update(data).eq('id', roomId).select()
        if (error) {
          console.error('[edit] error:', { code: error.code, message: error.message, details: error.details })
          throw error
        }
      } else {
        const currentResident = localStorage.getItem(RESIDENT_KEY)
        if (currentResident && currentResident !== roomId) {
          throw new Error(`他のタブですでに room #${currentResident} に入居しています。`)
        }

        const payload = { id: roomId, ...data }
        let { error } = await supabase.from('rooms').insert(payload).select()

        if (error?.code === 'PGRST204' && error.message.includes('bg_color')) {
          console.warn('[checkin] bg_color column missing, retrying without it')
          const { bg_color: _omit, ...without } = data
          void _omit
          const retry = await supabase.from('rooms').insert({ id: roomId, ...without }).select()
          error = retry.error
        }

        if (error?.code === '23505') {
          throw new Error('この部屋にはすでに入居者がいます。ページを更新してください。')
        }

        if (error) {
          console.error('[checkin] error:', { code: error.code, message: error.message, details: error.details, hint: error.hint })
          throw error
        }
      }

      if (modalMode === 'checkin') {
        const name = data.resident_name.trim() || null
        // await しないと supabase-js はリクエストを送らない（＝他セッションに保存されない）
        const { data: inserted } = await supabase
          .from('room_logs')
          .insert({ room_id: roomId, event_type: 'checkin', visitor_name: name })
          .select('id, event_type, visitor_name, created_at')
          .single()
        setLogs(prev => [
          (inserted as RoomLog) ?? {
            id: Date.now(),
            room_id: roomId,
            event_type: 'checkin' as const,
            visitor_name: name,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ])
      }
      localStorage.setItem(ownerKey(roomId), 'true')
      localStorage.setItem(RESIDENT_KEY, roomId)
      setIsOwner(true)
      setResidentRoomId(roomId)
      setShowModal(false)
    },
    [roomId, modalMode, isOwner]
  )

  // 退去処理
  const handleCheckout = useCallback(async () => {
    setCheckoutLoading(true)
    setCheckoutError('')
    const residentName = room?.resident_name ?? null
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)
    if (error) {
      console.error('[checkout] error:', error)
      setCheckoutError(error.message)
      setCheckoutLoading(false)
      return
    }
    // 退去ログを記録（訪問履歴に残す）。await しないと送信されない点に注意。
    const { data: inserted, error: logError } = await supabase
      .from('room_logs')
      .insert({ room_id: roomId, event_type: 'checkout', visitor_name: residentName })
      .select('id, event_type, visitor_name, created_at')
      .single()
    if (logError) {
      console.error('[checkout log] error:', { code: logError.code, message: logError.message, details: logError.details, hint: logError.hint })
    }
    if (inserted) setLogs(prev => [inserted as RoomLog, ...prev])
    localStorage.removeItem(ownerKey(roomId))
    localStorage.removeItem(RESIDENT_KEY)
    setIsOwner(false)
    setResidentRoomId(null)
    setRoom(null)
    setShowCheckoutConfirm(false)
    setCheckoutLoading(false)
  }, [roomId, room])

  const bgColor = room?.bg_color ?? '#ffffff'
  const alreadyResidentElsewhere = residentRoomId !== null && residentRoomId !== roomId

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-black/10 shrink-0">
        <Link
          href="/"
          className="text-xs text-gray-400 hover:text-black transition-colors tracking-widest"
        >
          ← {t.entrance}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-300 tracking-[0.3em]">{t.apartmentName}</span>
          <LangToggle />
        </div>
      </header>

      {/* Room content */}
      <main className="relative flex-1 overflow-auto flex flex-col items-center justify-center px-8 py-10">
        <div className="absolute top-3 right-4 z-10">
          <SettingsButton />
        </div>
        <div className="text-center w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 tracking-[0.5em]">{t.roomLabel}</p>
            <h1 className="text-5xl font-bold tracking-widest">#{roomId}</h1>
          </div>

          {logsLoaded && (() => {
            // 自分の現在セッションの行を除外し、「前の訪問者」の情報を表示する
            const others = logs.filter(l => l.id !== myLogId)
            const lastLog = others[0]
            // 自分以外の記録が無い → あなたが最初の訪問者
            if (!lastLog) {
              return (
                <div className="space-y-1">
                  <p className="text-xs text-gray-300 tracking-widest">{t.firstVisitor}</p>
                </div>
              )
            }
            const visitCount = others.filter(l => l.event_type === 'visit').length
            const timeStr = relativeTime(lastLog.created_at, lang)
            return (
              <div className="space-y-1">
                {visitCount > 0 && (
                  <p className="text-xs text-gray-300 tracking-widest">{t.visitCount(visitCount)}</p>
                )}
                <p className="text-xs text-gray-300 tracking-widest">
                  {lastLog.event_type === 'checkin'
                    ? t.lastCheckin(timeStr)
                    : lastLog.event_type === 'checkout'
                      ? t.lastCheckout(timeStr)
                      : lastLog.visitor_name
                        ? t.lastVisitBy(timeStr, lastLog.visitor_name)
                        : t.lastVisit(timeStr)}
                </p>
                <button
                  onClick={() => setShowHistory(true)}
                  className="text-xs text-gray-400 underline underline-offset-4 hover:text-black transition-colors tracking-widest"
                >
                  {t.historyButton}
                </button>
              </div>
            )
          })()}

          {room ? (
            // 入居中の部屋
            <div className="space-y-5">
              <h2 className="text-xl font-bold">{room.resident_name}</h2>
              <div className="flex gap-5 justify-center text-xs tracking-widest">
                {room.twitter && (
                  <a
                    href={`https://x.com/${room.twitter.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-black transition-colors"
                  >
                    X: @{room.twitter.replace(/^@/, '')}
                  </a>
                )}
                {room.instagram && (
                  <a
                    href={`https://instagram.com/${room.instagram.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-black transition-colors"
                  >
                    IG: @{room.instagram.replace(/^@/, '')}
                  </a>
                )}
              </div>
              {room.bio && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{room.bio}</p>
              )}
              {isOwner && (
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => { setModalMode('edit'); setShowModal(true) }}
                    className="text-xs tracking-widest text-gray-400 border border-gray-300 hover:border-black hover:text-black px-4 py-1.5 transition-colors"
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => setShowCheckoutConfirm(true)}
                    className="text-xs tracking-widest text-gray-400 border border-gray-300 hover:border-red-500 hover:text-red-500 px-4 py-1.5 transition-colors"
                  >
                    {t.moveOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 空室
            <div className="space-y-5">
              <p className="text-2xl text-gray-300 tracking-[0.5em]">{t.vacant}</p>
              {alreadyResidentElsewhere ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 tracking-widest">{t.alreadyResidentPre}</p>
                  <Link
                    href={`/room/${residentRoomId}`}
                    className="inline-block text-sm font-bold border-b border-black hover:opacity-60 transition-opacity"
                  >
                    room #{residentRoomId}
                  </Link>
                  {t.alreadyResidentPost && (
                    <p className="text-xs text-gray-400 tracking-widest">{t.alreadyResidentPost}</p>
                  )}
                  <p className="text-xs text-gray-300 tracking-widest pt-1">{t.mustMoveOutFirst}</p>
                </div>
              ) : (
                <button
                  onClick={() => { setModalMode('checkin'); setShowModal(true) }}
                  className="text-xs tracking-widest border border-black px-8 py-2.5 hover:bg-black hover:text-white transition-colors"
                >
                  {t.checkIn}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Door navigation */}
      <nav className="flex border-t border-black/10 shrink-0">
        <Link
          href={`/room/${leftDoorId}`}
          className="flex-1 flex flex-col items-center justify-center py-6 hover:bg-black/5 transition-colors border-r border-black/10 group"
        >
          <div className="w-10 h-16 border border-black/60 relative flex items-center justify-center group-hover:border-black transition-colors">
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-black/60 group-hover:border-black transition-colors" />
          </div>
          <span className="text-xs mt-2 text-gray-400 group-hover:text-black transition-colors tracking-widest">
            ← {leftDoorId}
          </span>
        </Link>
        <Link
          href={parentId ? `/room/${parentId}` : '/'}
          className="flex flex-col items-center justify-center py-6 px-6 hover:bg-black/5 transition-colors border-r border-black/10 group shrink-0"
        >
          <div className="w-8 h-8 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors text-lg">
            ↓
          </div>
          <span className="text-xs mt-2 text-gray-400 group-hover:text-black transition-colors tracking-widest whitespace-nowrap">
            {parentId ? `room ${parentId}` : t.entrance}
          </span>
        </Link>
        <Link
          href={`/room/${rightDoorId}`}
          className="flex-1 flex flex-col items-center justify-center py-6 hover:bg-black/5 transition-colors group"
        >
          <div className="w-10 h-16 border border-black/60 relative flex items-center justify-center group-hover:border-black transition-colors">
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-black/60 group-hover:border-black transition-colors" />
          </div>
          <span className="text-xs mt-2 text-gray-400 group-hover:text-black transition-colors tracking-widest">
            {rightDoorId} →
          </span>
        </Link>
      </nav>

      {showModal && (
        <CheckInModal
          roomId={roomId}
          currentRoom={room}
          isEditMode={modalMode === 'edit'}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showHistory && (
        <LogHistoryModal
          logs={logs.filter(l => l.id !== myLogId).slice(0, 10)}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showCheckoutConfirm && (
        <ConfirmDialog
          title={t.checkoutTitle}
          message={t.checkoutMessage(roomId)}
          confirmLabel={t.checkoutConfirm}
          cancelLabel={t.checkoutCancel}
          onConfirm={handleCheckout}
          onCancel={() => { setShowCheckoutConfirm(false); setCheckoutError('') }}
          loading={checkoutLoading}
          danger
        />
      )}

      {checkoutError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 tracking-widest">
          {t.checkoutFailed}: {checkoutError}
        </div>
      )}
    </div>
  )
}

import RoomView from '@/components/RoomView'

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // データフェッチはクライアントサイドで行う。
  // サーバーサイドで Supabase を待つとナビゲーションがブロックされるため。
  return <RoomView roomId={id} />
}

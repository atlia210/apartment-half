export type Room = {
  id: string
  resident_name: string | null
  twitter: string | null
  instagram: string | null
  bio: string | null
  bg_color: string
  created_at: string
  updated_at: string
}

export type RoomFormData = {
  resident_name: string
  twitter: string
  instagram: string
  bio: string
  bg_color: string
}

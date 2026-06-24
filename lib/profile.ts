import type { RoomFormData } from './types'

const PROFILE_KEY = 'apartment-half-profile'

export const emptyProfile: RoomFormData = {
  resident_name: '',
  twitter: '',
  instagram: '',
  bio: '',
  bg_color: '#ffffff',
}

export function getProfile(): RoomFormData {
  if (typeof window === 'undefined') return emptyProfile
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return emptyProfile
    return { ...emptyProfile, ...JSON.parse(raw) }
  } catch {
    return emptyProfile
  }
}

export function saveProfile(data: RoomFormData): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data))
}

export function hasProfile(): boolean {
  return getProfile().resident_name.trim().length > 0
}

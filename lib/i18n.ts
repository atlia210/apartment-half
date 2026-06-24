export type Lang = 'jp' | 'en'

export const translations = {
  jp: {
    // Root
    tagline: 'アパート1/2',
    chooseDoor: '扉を選んでください',
    // Header
    apartmentName: 'アパート1/2',
    entrance: 'entrance',
    // Room
    roomLabel: 'ROOM',
    vacant: '空室',
    checkIn: '入居する',
    alreadyResidentPre: 'あなたはすでに',
    alreadyResidentPost: 'に入居中です',
    mustMoveOutFirst: '退去してから入居できます',
    edit: 'EDIT',
    moveOut: '退去する',
    // CheckInModal
    checkInModalTitle: (roomId: string) => `ROOM #${roomId} に入居する`,
    editModalTitle: '情報を編集',
    nameLabel: 'NAME *',
    twitterLabel: 'X (TWITTER)',
    instagramLabel: 'INSTAGRAM',
    bioLabel: 'BIO',
    roomColorLabel: 'ROOM COLOR',
    namePlaceholder: 'あなたの名前',
    bioPlaceholder: '自己紹介（任意）',
    cancelButton: 'CANCEL',
    checkInButton: 'CHECK IN',
    updateButton: 'UPDATE',
    nameRequired: '名前を入力してください',
    submitError: 'エラーが発生しました',
    // ConfirmDialog
    checkoutTitle: '退去の確認',
    checkoutMessage: (roomId: string) =>
      `本当に room #${roomId} から退去しますか？\n入居者情報はすべて削除されます。`,
    checkoutConfirm: '退去する',
    checkoutCancel: 'キャンセル',
    // Room logs
    visitCount: (n: number) => `今まで ${n} 人がこの部屋を訪問しました`,
    lastVisit: (time: string) => `${time}に誰かが部屋を訪問しました`,
    lastVisitBy: (time: string, name: string) => `${time}に ${name} が部屋を訪問しました`,
    lastCheckin: (time: string) => `${time}に入居されました`,
    firstVisitor: 'あなたが初めての訪問者です',
    // Welcome (first visit)
    welcomeTitle: 'ようこそ アパート1/2 へ',
    welcomeNamePrompt: 'あなたの名前を教えてください（ニックネーム可）',
    welcomeNameButton: 'はじめる',
    // Settings
    settings: '設定',
    settingsTitle: '入居情報の事前登録',
    settingsDescription: 'ここで登録した情報は、入居時に自動で入力されます。',
    saveButton: '保存',
    savedMessage: '保存しました',
    // Error toast
    checkoutFailed: '退去失敗',
  },
  en: {
    // Root
    tagline: 'APARTMENT 1/2',
    chooseDoor: 'choose a door',
    // Header
    apartmentName: 'APARTMENT 1/2',
    entrance: 'entrance',
    // Room
    roomLabel: 'ROOM',
    vacant: 'VACANT',
    checkIn: 'check in',
    alreadyResidentPre: 'you already live in',
    alreadyResidentPost: '',
    mustMoveOutFirst: 'move out first to check in here',
    edit: 'EDIT',
    moveOut: 'move out',
    // CheckInModal
    checkInModalTitle: (roomId: string) => `CHECK IN — ROOM #${roomId}`,
    editModalTitle: 'EDIT ROOM',
    nameLabel: 'NAME *',
    twitterLabel: 'X (TWITTER)',
    instagramLabel: 'INSTAGRAM',
    bioLabel: 'BIO',
    roomColorLabel: 'ROOM COLOR',
    namePlaceholder: 'your name',
    bioPlaceholder: 'bio (optional)',
    cancelButton: 'CANCEL',
    checkInButton: 'CHECK IN',
    updateButton: 'UPDATE',
    nameRequired: 'name is required',
    submitError: 'something went wrong',
    // ConfirmDialog
    checkoutTitle: 'CONFIRM MOVE OUT',
    checkoutMessage: (roomId: string) =>
      `Are you sure you want to move out of room #${roomId}?\nAll resident data will be deleted.`,
    checkoutConfirm: 'move out',
    checkoutCancel: 'cancel',
    // Room logs
    visitCount: (n: number) => `${n} ${n === 1 ? 'person has' : 'people have'} visited this room`,
    lastVisit: (time: string) => `someone visited ${time}`,
    lastVisitBy: (time: string, name: string) => `${name} visited ${time}`,
    lastCheckin: (time: string) => `checked in ${time}`,
    firstVisitor: 'you are the first visitor',
    // Welcome (first visit)
    welcomeTitle: 'WELCOME TO APARTMENT 1/2',
    welcomeNamePrompt: 'What is your name? (nickname is fine)',
    welcomeNameButton: 'START',
    // Settings
    settings: 'settings',
    settingsTitle: 'PRE-REGISTER YOUR INFO',
    settingsDescription: 'This info will be auto-filled when you check in.',
    saveButton: 'SAVE',
    savedMessage: 'saved',
    // Error toast
    checkoutFailed: 'move out failed',
  },
} satisfies Record<Lang, Record<string, unknown>>

export function relativeTime(dateStr: string, lang: Lang): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return lang === 'jp' ? 'たった今' : 'just now'
  if (mins < 60) return lang === 'jp' ? `${mins}分前` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return lang === 'jp' ? `${hours}時間前` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return lang === 'jp' ? `${days}日前` : `${days}d ago`
}

export type Translations = (typeof translations)['jp']

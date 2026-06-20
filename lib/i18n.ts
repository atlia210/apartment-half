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
    // Error toast
    checkoutFailed: 'move out failed',
  },
} satisfies Record<Lang, Record<string, unknown>>

export type Translations = (typeof translations)['jp']

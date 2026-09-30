export const BITTY_SESSION_KEY = 'bitty-intro-seen-v1'

export function shouldAutoplayIntro(storage: Storage, reducedMotion: boolean) {
  return !reducedMotion && storage.getItem(BITTY_SESSION_KEY) !== 'true'
}

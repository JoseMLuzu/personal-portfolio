export type BittyTechnologyPose = 'normal' | 'wink' | 'cat' | 'whale' | 'surprised'
export type Technology = {
  name: string
  context: 'experience' | 'portfolio'
  usage: string
  pose: BittyTechnologyPose
  note?: string
  href?: string
}
export type TechnologyGroup = {
  id: string
  title: string
  items: Technology[]
}

// Only user-confirmed experience or tools verifiable in this repository.
// Add specific database engines and other skills once José confirms them.
export const technologyGroups: TechnologyGroup[] = [
  { id: 'languages', title: 'Languages', items: [
    { name: 'Python', context: 'experience', usage: 'Bitty’s backend is written in Python.', pose: 'wink' },
    { name: 'TypeScript', context: 'portfolio', usage: 'Types the projects and Bitty’s response contract.', pose: 'normal' },
    { name: 'HTML', context: 'portfolio', usage: 'Names and technologies remain accessible text.', pose: 'normal' },
    { name: 'CSS', context: 'portfolio', usage: 'Shapes the pixel curtains and adapts the scenes to mobile.', pose: 'wink' },
  ] },
  { id: 'frameworks', title: 'Frameworks', items: [
    { name: 'React', context: 'experience', usage: 'Separates the hero, projects and Bitty’s scenes.', pose: 'wink' },
    { name: 'FastAPI', context: 'portfolio', usage: 'Exposes POST /api/bitty/message without revealing the AI key.', pose: 'normal' },
    { name: 'Motion', context: 'portfolio', usage: 'Animates the assistant and Bitty’s interactive lab.', pose: 'wink' },
    { name: 'GSAP', context: 'portfolio', usage: 'Coordinates the parachute, tide and whale ride.', pose: 'whale' },
  ] },
  { id: 'tools', title: 'Tools', items: [
    { name: 'Vite', context: 'portfolio', usage: 'Serves the portfolio locally and produces its build.', pose: 'normal' },
    { name: 'Vitest', context: 'portfolio', usage: 'Tests scenes, navigation and interruptions.', pose: 'surprised' },
    { name: 'Testing Library', context: 'portfolio', usage: 'Tests buttons, focus and content through the interface.', pose: 'normal' },
    { name: 'Git', context: 'portfolio', usage: 'Tracks portfolio changes in scoped commits.', pose: 'wink' },
    { name: 'GitHub', context: 'portfolio', usage: 'Hosts this portfolio’s repository.', pose: 'cat', href: 'https://github.com/JoseMLuzu/personal-portfolio' },
  ] },
  { id: 'data', title: 'Databases', items: [
    { name: 'Databases', context: 'experience', usage: 'Confirmed experience; database engines and projects still need documentation.', pose: 'normal', note: 'Database engines and projects to document.' },
  ] },
  { id: 'ai', title: 'AI & integrations', items: [
    { name: 'OpenRouter', context: 'portfolio', usage: 'Bitty calls the model from the server, with a fallback mode.', pose: 'surprised', note: 'Bitty’s backend integration.' },
  ] },
]

// This is a scene prop, deliberately NOT part of the skills list.
export const dockerSceneReference = { name: 'Docker', usage: 'The whale carries Bitty in this scene; Docker experience is unconfirmed.', pose: 'whale' as const }
export const bittyTechnologySprites: Record<BittyTechnologyPose, string> = {
  normal: '/assets/bitty-stand.png', wink: '/assets/bitty-nav-wink.png',
  cat: '/assets/bitty-nav-github-kiss.png', whale: '/assets/bitty-whale-wave.png',
  surprised: '/assets/bitty-tap-oops.png',
}

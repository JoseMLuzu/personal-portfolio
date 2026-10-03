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

// José’s requested stack. Project-specific claims are included only when verified.
export const technologyGroups: TechnologyGroup[] = [
  { id: 'languages', title: 'Languages', items: [
    { name: 'JavaScript', context: 'experience', usage: 'Part of my stack; project-specific usage still to document.', pose: 'wink' },
    { name: 'TypeScript', context: 'experience', usage: 'Types the projects and Bitty’s response contract.', pose: 'normal' },
    { name: 'Python', context: 'experience', usage: 'Bitty’s backend is written in Python.', pose: 'wink' },
    { name: 'Swift', context: 'experience', usage: 'Part of my stack; project-specific usage still to document.', pose: 'normal' },
  ] },
  { id: 'frameworks', title: 'Frameworks & platforms', items: [
    { name: 'React', context: 'experience', usage: 'Separates the hero, projects and Bitty’s scenes.', pose: 'wink' },
    { name: 'Flask', context: 'experience', usage: 'Part of my stack; project-specific usage still to document.', pose: 'normal' },
    { name: 'Capacitor', context: 'experience', usage: 'Part of my stack; project-specific usage still to document.', pose: 'wink' },
    { name: 'WordPress', context: 'experience', usage: 'Part of my stack; project-specific usage still to document.', pose: 'normal' },
  ] },
  { id: 'tools', title: 'Tools', items: [
    { name: 'Git', context: 'experience', usage: 'Tracks portfolio changes in scoped commits.', pose: 'wink' },
    { name: 'GitHub', context: 'experience', usage: 'Hosts this portfolio’s repository.', pose: 'cat', href: 'https://github.com/JoseMLuzu/personal-portfolio' },
    { name: 'Docker', context: 'experience', usage: 'Part of my stack; project-specific usage still to document. Bitty also borrows the whale for this scene.', pose: 'whale' },
  ] },
  { id: 'data', title: 'Databases', items: [
    { name: 'PostgreSQL', context: 'experience', usage: 'Part of my stack; project-specific usage still to document.', pose: 'normal' },
    { name: 'Supabase', context: 'experience', usage: 'Part of my stack; project-specific usage still to document.', pose: 'wink' },
  ] },
]

export const bittyTechnologySprites: Record<BittyTechnologyPose, string> = {
  normal: '/assets/bitty-stand.png', wink: '/assets/bitty-nav-wink.png',
  cat: '/assets/bitty-nav-github-kiss.png', whale: '/assets/bitty-whale-wave.png',
  surprised: '/assets/bitty-tap-oops.png',
}

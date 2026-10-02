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
  { id: 'languages', title: 'Lenguajes', items: [
    { name: 'Python', context: 'experience', usage: 'El backend de Bitty está escrito en Python.', pose: 'wink' },
    { name: 'TypeScript', context: 'portfolio', usage: 'Tipa los proyectos y el contrato de respuesta de Bitty.', pose: 'normal' },
    { name: 'HTML', context: 'portfolio', usage: 'Nombres y tecnologías siguen siendo texto accesible.', pose: 'normal' },
    { name: 'CSS', context: 'portfolio', usage: 'Da forma a las cortinas pixeladas y adapta las escenas al móvil.', pose: 'wink' },
  ] },
  { id: 'frameworks', title: 'Frameworks', items: [
    { name: 'React', context: 'experience', usage: 'Separa el hero, los proyectos y las escenas de Bitty.', pose: 'wink' },
    { name: 'FastAPI', context: 'portfolio', usage: 'Expone POST /api/bitty/message sin revelar la clave de IA.', pose: 'normal' },
    { name: 'Motion', context: 'portfolio', usage: 'Anima el asistente y el laboratorio interactivo de Bitty.', pose: 'wink' },
    { name: 'GSAP', context: 'portfolio', usage: 'Coordina el paracaídas, la ola y el regreso en ballena.', pose: 'whale' },
  ] },
  { id: 'tools', title: 'Herramientas', items: [
    { name: 'Vite', context: 'portfolio', usage: 'Sirve el portafolio local y genera su build.', pose: 'normal' },
    { name: 'Vitest', context: 'portfolio', usage: 'Prueba las escenas, la navegación y las interrupciones.', pose: 'surprised' },
    { name: 'Testing Library', context: 'portfolio', usage: 'Prueba botones, foco y contenido desde la interfaz.', pose: 'normal' },
    { name: 'Git', context: 'portfolio', usage: 'Guarda los cambios del portafolio en commits por ámbito.', pose: 'wink' },
    { name: 'GitHub', context: 'portfolio', usage: 'Aloja el repositorio de este portafolio.', pose: 'cat', href: 'https://github.com/JoseMLuzu/personal-portfolio' },
  ] },
  { id: 'data', title: 'Bases de datos', items: [
    { name: 'Bases de datos', context: 'experience', usage: 'Experiencia confirmada; falta documentar motores y proyectos.', pose: 'normal', note: 'Motores y proyectos por documentar.' },
  ] },
  { id: 'ai', title: 'IA e integraciones', items: [
    { name: 'OpenRouter', context: 'portfolio', usage: 'Bitty consulta el modelo desde el servidor, con modo alternativo.', pose: 'surprised', note: 'Integración de Bitty desde el backend.' },
  ] },
]

// This is a scene prop, deliberately NOT part of the skills list.
export const dockerSceneReference = { name: 'Docker', usage: 'La ballena transporta a Bitty en esta escena; experiencia con Docker por confirmar.', pose: 'whale' as const }
export const bittyTechnologySprites: Record<BittyTechnologyPose, string> = {
  normal: '/assets/bitty-stand.png', wink: '/assets/bitty-nav-wink.png',
  cat: '/assets/bitty-nav-github-kiss.png', whale: '/assets/bitty-whale-wave.png',
  surprised: '/assets/bitty-tap-oops.png',
}

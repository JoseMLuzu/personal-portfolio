export type TechnologyGroup = {
  id: string
  title: string
  items: { name: string; context: 'experience' | 'portfolio'; note?: string }[]
}

// Only user-confirmed experience or tools verifiable in this repository.
// Add specific database engines and other skills once José confirms them.
export const technologyGroups: TechnologyGroup[] = [
  { id: 'languages', title: 'Lenguajes', items: [
    { name: 'Python', context: 'experience' },
    { name: 'TypeScript', context: 'portfolio' },
    { name: 'HTML', context: 'portfolio' },
    { name: 'CSS', context: 'portfolio' },
  ] },
  { id: 'frameworks', title: 'Frameworks', items: [
    { name: 'React', context: 'experience' },
    { name: 'FastAPI', context: 'portfolio' },
    { name: 'Motion', context: 'portfolio' },
  ] },
  { id: 'tools', title: 'Herramientas', items: [
    { name: 'Vite', context: 'portfolio' },
    { name: 'Vitest', context: 'portfolio' },
    { name: 'Testing Library', context: 'portfolio' },
    { name: 'Git', context: 'portfolio' },
  ] },
  { id: 'data', title: 'Bases de datos', items: [
    { name: 'Bases de datos', context: 'experience', note: 'Motores y proyectos por documentar.' },
  ] },
  { id: 'ai', title: 'IA e integraciones', items: [
    { name: 'OpenRouter', context: 'portfolio', note: 'Integración de Bitty desde el backend.' },
  ] },
]

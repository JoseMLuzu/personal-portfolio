import type { BittyReply } from '../types'

const localFallback: BittyReply = {
  text: 'Ahora mismo no puedo consultar el backend, pero puedes explorar los proyectos directamente aquí abajo.',
  project: null,
  action: { type: 'scroll_projects', projectSlug: null },
  source: 'fallback',
}

export async function askBitty(message: string, signal?: AbortSignal): Promise<BittyReply> {
  try {
    const response = await fetch('/api/bitty/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal,
    })

    if (!response.ok) return localFallback
    return (await response.json()) as BittyReply
  } catch {
    return localFallback
  }
}

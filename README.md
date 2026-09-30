# Portafolio de José Manuel Luzuriaga

MVP de portafolio personal construido con React, TypeScript, Vite, Python y FastAPI. Los proyectos son accesibles directamente y Bitty añade una capa opcional de humor, descubrimiento y preguntas con IA.

## Requisitos

- Node.js 20 o superior
- Python 3.9–3.13 (3.11 o superior recomendado)
- `uv` (recomendado) o `pip`

## Ejecutar en local

### 1. Frontend

```bash
npm install
npm run dev
```

Vite abre el sitio en `http://localhost:5173`. Las llamadas `/api` se redirigen a FastAPI en el puerto 8000.

### 2. Backend

En otra terminal:

```bash
cp .env.example .env
uv venv .venv
source .venv/bin/activate
uv pip install -r backend/requirements.txt
set -a && source .env && set +a
uvicorn app.main:app --app-dir backend --reload
```

La clave de OpenRouter es opcional. Sin `OPENROUTER_API_KEY`, Bitty responde con el modo alternativo usando únicamente el contenido local verificado.

Para habilitar IA, completa en `.env`:

```dotenv
OPENROUTER_API_KEY=tu_clave
OPENROUTER_MODEL=openrouter/free
```

La clave permanece en FastAPI; no existe ninguna variable `VITE_` para ella.

## Pruebas

```bash
npm test
source .venv/bin/activate
PYTHONPATH=backend pytest backend/tests
npm run build
```

Las pruebas cubren la escena en primera visita, reproducción manual, acción táctil de Seeds, navegación y teclado, movimiento reducido, API sin clave, error de OpenRouter y el contrato de acciones controladas por el servidor.

## Arquitectura

- `src/components/BittyScene.tsx`: escena breve por estados; `sessionStorage` evita repetirla automáticamente.
- `src/components/BittyChat.tsx`: interfaz de preguntas. Solo React interpreta las acciones permitidas.
- `src/api/bitty.ts`: cliente y alternativa local si el backend no está disponible.
- `content/projects.json`: fuente legible de datos y campos pendientes de revisión.
- `backend/app/main.py`: selección de contexto, OpenRouter, timeout, validación, límite de solicitudes y respuestas alternativas.
- `public/assets/bitty-motion-sprites.png`: spritesheet 3×3 de Bitty para sorpresa, caminata, recogida y colocación.
- `public/assets/bitty-sprites.png`: spritesheet complementario para la presentación de la carpeta de Seeds.
- `public/assets/bitty-project-poses.png`: poses específicas de Bitty sentado y colgándose en los bordes de los proyectos.

## Contrato de Bitty

`POST /api/bitty/message`

```json
{
  "message": "¿Qué es Seeds?"
}
```

Devuelve:

```json
{
  "text": "Respuesta breve y verificable.",
  "project": { "slug": "seeds", "title": "Seeds", "url": "https://seed-rouge-eight.vercel.app" },
  "action": { "type": "show_project", "projectSlug": "seeds" },
  "source": "ai"
}
```

El modelo solo genera `text`. El backend decide `project` y `action` a partir de una lista cerrada, y React ejecuta la navegación. Así, una respuesta generada nunca puede ordenar acciones arbitrarias.

## Contenido que José debe revisar

`content/projects.json` marca cada dato pendiente en `needsReview`. Antes de publicar conviene completar, por proyecto:

1. Problema y usuario objetivo.
2. Contribución personal concreta.
3. Stack realmente usado y decisiones técnicas.
4. Resultado verificable, sin métricas estimadas.
5. Estado y enlace de FinTrack, si existe una demo pública.

Las descripciones actuales de Seeds y HostiQR son prudentes y se basan únicamente en lo visible en sus demos públicas. No se atribuyen clientes, métricas ni resultados.

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

- `src/components/Hero.tsx` y `Hero.css`: presentación limpia y estilos locales del hero, sin tarjetas ni escenarios.
- `src/components/BittyScene.tsx`: escena por fases (8,7 s): «iaga» cae a la derecha, Bitty lo nota y busca la cortina en el borde, la cierra hasta la «i» y repara detrás. Al abrirla las letras están colocadas, algo torcidas; un toque las endereza. La cortina usa `public/assets/bitty-indigo-curtain.png` con desenfoque del fondo en las zonas transparentes, sin relleno morado. `sessionStorage` evita repetirla automáticamente. Pointer, teclado, rueda, tacto, scroll o salida del hero completan la escena sin cancelar la interacción.
- `src/components/BittyChat.tsx`: interfaz de preguntas. Solo React interpreta las acciones permitidas.
- `src/components/BittyGuide.tsx`: controlador del recorrido. Detecta la sección visible, recuerda el modo guía y la preferencia de ocultar en `localStorage`, y abre fichas sin IA.
- `src/components/ProjectArrivalBitty.tsx`: llegada con Motion, precarga de poses, repetición y modo de movimiento reducido.
- `src/components/Technologies.tsx`, `Technologies.css` y `useTechnologyTide.ts`: marea de 9.7 segundos, una vez por sesión; el agua cubre las categorías, Bitty hace ida y vuelta y desembarca en el asistente fijo. Las palabras quedan ligeramente torcidas. [Secuencia y assets](docs/technology-tide.md).
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

### Completar un caso

Edita `caseStudy.problem`, `caseStudy.contribution` y `caseStudy.decisions` en `content/projects.json`. Los valores `null` aparecen como pendientes. Añade un resultado verificable en `result` y el repositorio confirmado en `repositoryUrl`. El mismo JSON es el contexto que consume FastAPI: no introduzcas textos ficticios para rellenar la ficha.

Para Seeds, documenta especialmente: quién necesitaba organizar ideas, qué partes implementaste personalmente, qué stack usaste y una decisión con su alternativa y limitación. La ficha del propio portafolio, bajo «Sobre mí», explica decisiones comprobables en este repositorio y sirve de ejemplo de estructura.

### Recorrido de Bitty

El botón «Habla con Bitty» abre acciones relacionadas con la sección actual. «Modo guía» muestra una invitación breve durante el recorrido, sin abrir el panel automáticamente. «Ocultar a Bitty» desactiva sus escenas y deja un control para recuperarlo. Las acciones rápidas y la tarjeta de Seeds son locales; solo una pregunta enviada al formulario llama a la API. Escape cierra el panel y devuelve el foco al botón.

El asistente muestra globos de diálogo descartables y se mueve desde «Mover»: arrastrar con mouse o usar flechas con el asa enfocada. El botón ↺ recupera su posición y abrir el panel lo devuelve al borde para evitar que quede fuera de la pantalla. En móvil se mantiene en su posición y usa toques.

El asistente flotante espera fuera del hero para que allí solo aparezca el Bitty de la escena del nombre. La acción de Seeds continúa disponible en el asistente y los proyectos. El hero reutiliza las poses de sorpresa, brazos alzados y saludo del spritesheet existente. Para mejorar los contactos con las cortinas se pueden crear después dos poses específicas: tirar de una cortina y enderezar una letra con un dedo. No son necesarias para ejecutar la escena actual.

`src/components/BittyCodeLab.tsx` contiene dos demostraciones accesibles: parámetros de un resorte de Motion aplicados a la mirada, y respuestas deterministas por proyecto sin red. El fragmento real de los resortes se importa como texto con `?raw` desde `ProjectArrivalBitty.tsx`, para que siga conectado al código del proyecto. Los valores configurables son solo del laboratorio; no alteran las preferencias de movimiento del visitante ni la animación principal.

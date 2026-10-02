# Prueba de cielo y paracaídas

`Projects.tsx` reemplaza la llegada por cuerda en el montaje de `App.tsx`, sin borrar la escena anterior. `Projects.css` limita el cambio visual a proyectos. El asistente se recoge en un botón durante esta sección (salvo modo guía o panel abierto) para no duplicar a Bitty.

GSAP ScrollTrigger vincula una timeline al recorrido de la sección: de `top 12%` a `bottom bottom`, con suavizado de 0.55 segundos, sin fijar ni bloquear el scroll. Bitty desciende por un margen reservado; las nubes se desplazan a dos velocidades y el paracaídas oscila ligeramente. Subir revierte el recorrido. Las fichas siguen siendo HTML real, con sus enlaces y botones originales.

`ResizeObserver` actualiza la geometría al abrir una ficha. `gsap.matchMedia` deja una escena estática con movimiento reducido. El contexto, observador, frame pendiente y ScrollTrigger se limpian al desmontar.

## Assets

- `public/assets/bitty-rope-hang.png`: sprite original de Bitty, sin modificar.
- `public/assets/bitty-parachute.png`: 1254 × 1254, PNG transparente, generado con la herramienta integrada imagegen.
- `public/assets/project-sky-clouds.png`: 2172 × 724, PNG transparente, generado con la herramienta integrada imagegen.
- `public/assets/stack-beach-sand.png`: imagen de arena proporcionada por el usuario, copiada sin editar para la sección siguiente.

No se generó otro personaje ni se añadieron dependencias. No se usó la CLI de generación. Los originales generados se conservaron fuera del proyecto; las copias consumidas por React están en `public/assets`.

## Prompts finales

### Paracaídas

```text
Use case: stylized-concept
Asset type: transparent 2D pixel-art parachute overlay for a retro web game
Primary request: isolated parachute canopy and rigging only, no person or mascot.
Scene/backdrop: actual transparent background with alpha channel, not a painted checkerboard.
Style/medium: crisp 2D pixel art with pixel-stepped edges, navy outline and restrained flat shading.
Composition/framing: centered symmetric front view on square canvas. Inflated dome occupies upper approximately 45% of canvas. Four clearly separated cream-and-navy suspension rope lines extend down and converge near bottom center. Leave no character below them. Complete object visible, no clipping.
Color palette: alternating warm cream and coral canopy panels, dark navy outline, tiny cyan accent.
Constraints: no person, no mascot, no Bitty, no sky, no clouds, no basket, no text, no logo, no watermark. Output one finished transparent sprite.
```

### Nubes

```text
Use case: stylized-concept
Asset type: transparent wide cloud layer for a retro pixel-art web game
Primary request: one isolated wide cluster of 2–3 elegant pixel-art clouds suitable for layering over an azure sky.
Scene/backdrop: actual transparent background with alpha channel, not a painted checkerboard.
Style/medium: crisp 2D pixel art, pixel-stepped silhouettes, flat warm-white highlights and pale-blue shadows, restrained elegant retro game art.
Composition/framing: wide horizontal grouping, 2–3 clouds of slightly varied size, fully visible with transparent padding around edges.
Constraints: clouds only; no sky, ground, person, mascot, parachute, text, logo, watermark or background fill. Output one finished transparent sprite layer.
```

# Marea de tecnologías

La sección mantiene las 13 tecnologías originales de `src/content/technologies.ts`. Docker no se ha añadido como habilidad: la ballena es un recurso decorativo. Si José confirma Docker y lo añade al contenido, su reacción está preparada (12 px / 3 grados).

El diseño usa el mockup del stack como referencia, no como fondo: título grande con subrayado coral, categorías sin iconos ni bordes y nombres monoespaciados en tres columnas (dos en tablet y una en móvil). Los puntos cian indican experiencia confirmada; la explicación permanece visible y las etiquetas de cada tecnología siguen disponibles para lectores de pantalla. Se conservan los grupos de datos e IA, aunque no aparezcan en el mockup, para no perder contenido existente.

## Código y secuencia

- `src/components/Technologies.tsx`: sección semántica y capa decorativa `aria-hidden`, sin duplicar el texto.
- `src/components/useTechnologyTide.ts`: observa la sección y el carril inferior. Arranca cuando hay al menos un 35% de la sección y un 15% del carril visibles, tras precargar los tres PNG. Esto evita reproducir la escena fuera de pantalla en móviles con una sección larga.
- `src/components/Technologies.css`: agua hasta encima de las categorías, ida y vuelta horizontal, flotación vertical y reacción de palabras completas. La altura absoluta se calcula una vez al iniciar, sin cambiar el layout. Decoración detrás del contenido y `pointer-events: none`.
- `src/components/BittyGuide.tsx` y `BittyChat.tsx`: reconocen esta sección y recogen el asistente durante el viaje. El evento local `bitty-tide-arrived` lo revela al desembarcar; continúa fijo al viewport durante el scroll. En esta sección no muestra el globo grande para no tapar las tecnologías. No se crea una segunda mascota ni se llama a la IA.

Fases: `idle` → `rising` (0 ms) → `floating` (1400 ms) → `crossing` (2300 ms) → `waving` (4700 ms) → `returning` (5100 ms) → `disembarking` (7500 ms) → `draining` (8300 ms) → `settled` (9700 ms). `done` es la alternativa estática para sesiones ya vistas, interrupciones y movimiento reducido.

Primero sube el agua durante 1400 ms. Después empiezan a flotar los nombres completos entre 8 y 12 px, con balanceo suave y pequeños retrasos. Tras una pausa de 900 ms aparece la ballena desde la derecha, cruza hacia la izquierda, gira y vuelve a la derecha. Cada recorrido dura 2400 ms, con una pausa de 400 ms entre ambos. El sprite se refleja según la dirección. Al desembarcar, la ballena se desvanece hacia abajo y el Bitty del asistente aparece con una pequeña caída en la esquina inferior derecha. Al bajar el agua en 1400 ms, los nombres quedan desplazados 4–8 px y torcidos entre −1.5 y 2 grados. En móvil las amplitudes se reducen. Los elementos de lista no cambian de dimensiones ni de orden. El movimiento usa `transform` y `opacity`, sin dependencias nuevas.

`sessionStorage['bitty-technologies-tide-seen-v3']` registra el inicio y evita repetición al volver o recargar. `bitty-technologies-arrived-v3` conserva el desembarco del asistente. La versión nueva permite ver esta secuencia aunque ya se hubiera reproducido la anterior. Para revisar de nuevo en desarrollo:

```js
sessionStorage.removeItem('bitty-technologies-tide-seen-v3')
sessionStorage.removeItem('bitty-technologies-arrived-v3')
location.reload()
```

Desmontar limpia timers, observer, handlers de precarga y listeners. Movimiento reducido, error al cargar un recurso o falta de IntersectionObserver dejan el contenido estático. Un cambio a movimiento reducido, cambio de tamaño o pestaña oculta completa una escena iniciada sin dejarla a medias.

## Assets

- `public/assets/bitty-whale-wave.png`: sprite adjunto «Bitty waves atop a blue whale», orientado hacia la derecha.
- `public/assets/bitty-whale-ride.png`: sprite adjunto «Bitty rides the container whale», reflejado hacia la derecha con la propiedad independiente `scale`, que no es sobrescrita por los keyframes de `transform`. Al aparcar se cambia suavemente a la pose de saludo.
- `public/assets/bitty-cyan-foam-water.png`: agua adjunta «Pixel water overlay with cyan foam», transparencia conservada. Es el agua activa de esta versión.
- `public/assets/bitty-pixel-water.png`: agua anterior generada con el tool integrado ImageGen, conservada como recurso histórico; ya no se utiliza en la escena.

No falta ningún asset para ejecutar esta versión. Para un desembarco articulado en vez de la transición actual, convendría crear una ballena sin Bitty y un sprite de Bitty saltando de ella.

Prompt histórico del agua anterior (no se ha generado una imagen nueva en esta actualización):

> Use case: stylized-concept. Asset type: standalone transparent pixel-art water strip for a React portfolio animation, not a web mockup. Create only a wide horizontal ocean band: chunky crisp 8-bit stepped wave crests with pale cyan highlights, deep cobalt and navy water below, sparse rectangular blue reflections. Water fills the bottom 55% of the canvas down to the bottom edge; the top 45% above the irregular crests is genuinely transparent. Wide landscape composition, horizontally repeatable edges, modest shallow waves, restrained contrast suitable behind warm white web text on #080e20. No Bitty, no whale, no boats, no characters, no logos, absolutely no text, no UI, no scene or sky, no floating objects. Sharp pixel grid, no gradients or soft glow. This asset is an independent lightweight water layer inspired by the supplied pixel tide mockup, not a screenshot.

## Verificación

Pruebas de contenido, fases, entrega al asistente, umbral de visibilidad, reproducción única, movimiento reducido, desmontaje y fallo de assets en `Technologies.test.tsx`. QA de navegador en 1440, 768, 390 y 320 px: dos recorridos, nombres flotantes y estado final torcido, asistente fijo, contenido accesible, sin overflow ni cambios en la geometría de listas y sin repetición al volver o recargar.

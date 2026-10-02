# Mi stack: playa y ola opcional

## Versión actual: playa (1 de octubre de 2026)

Se usa `public/assets/stack-beach-sand.png`, copia sin editar de la imagen de arena suministrada. La llave, el chorro y sus poses de apertura/cierre ya no se montan ni se precargan. Sus archivos se conservan para poder recuperar el diseño anterior.

La sección muestra únicamente título, controles y nombres agrupados. Se quitaron la leyenda de experiencia, el mensaje visible de Bitty y «Docker · guiño de la escena». Los usos verificables siguen asociados a los nombres con `aria-describedby`; las reacciones se anuncian en un estado solo para lectores de pantalla. Docker no se añade como habilidad. Menos padding superior/inferior y menor separación entre categorías eliminan el escenario vacío anterior.

La ola se activa con «Ver la ola», no automáticamente al entrar. Una timeline GSAP de 7 segundos coordina `notice` (0), `fill` (0.65), `sweptAway` (2.05), `whaleReturn` (3.25), `landing` (5.1) y `drain` (5.9). Se mantienen las dos capas del mar, el movimiento de palabras completas, el viaje en ballena y el regreso a la pose normal. La geometría se calcula desde la cuadrícula, sin referencias a una llave.

«Saltar» completa todos los movimientos y devuelve el foco al control persistente «Repetir». Los cambios de pose siguen funcionando con ratón, teclado y toque. Al salir, ocultar la pestaña, redimensionar o activar movimiento reducido, se completa la escena; `useGSAP` limpia todo al desmontar. Con movimiento reducido se presenta directamente el desenlace. No hay ScrollTrigger ni observador de entrada en esta sección: solo el cielo de proyectos depende del scroll.

Verificación: pruebas de todas las fases y limpieza, activación manual, repetición, foco, falta de assets y movimiento reducido. Navegador en 1440/768/390/320 px, sin desbordamiento horizontal ni saltos de layout al activar la ola.

---

## Archivo de la versión anterior: llave (ya no activa)

El contenido sigue siendo HTML real y legible antes de cualquier interacción. Hay 15 tecnologías verificables en `src/content/technologies.ts`, organizadas en las cinco categorías existentes; GSAP y GitHub están presentes en el proyecto. El repositorio de GitHub se confirmó con el remoto de Git. Docker aparece separado como **guiño de la escena**, no como habilidad confirmada. No se añaden motores de bases de datos ni experiencia no documentada.

## Archivos y responsabilidades

- `src/content/technologies.ts`: nombres, contexto (experiencia o herramienta del portafolio), frases específicas sobre su uso y mapa de sprites existentes.
- `src/components/Technologies.tsx`: botones semánticos para explorar, descripción accesible por tecnología, enlace independiente al repositorio, estado de tecnología activa, capas de poses, llave y controles «Saltar»/«Repetir».
- `src/components/Technologies.css`: diseño editorial navy/crema/cian/coral, margen lateral reservado para Bitty, fundido breve de poses, pop de la llave y variantes móviles/reducidas.
- `src/components/useTechnologyTide.ts`: precarga, descubrimiento de la llave con ScrollTrigger, acciones explícitas de inicio/salto, preferencia de movimiento y limpieza dentro de useGSAP.
- `src/animations/technologyFlood.ts`: geometría y timeline de 7 segundos. `FLOOD_LABELS` define los momentos narrativos en segundos y `FLOOD_DURATION` documenta la duración comprobada por las pruebas.
- `src/components/Technologies.test.tsx`: pruebas de contenido, exploración, flujo opcional, timeline, salto, foco, repetición, Strict Mode y casos alternativos.

GSAP y @gsap/react ya están instalados. Motion se conserva para las demás escenas. No se introduce Three.js ni otra dependencia.

## Flujo normal

ScrollTrigger calcula la entrada de la **llave**, no solo la de la sección: al alcanzar el 85% del viewport se revela con un pop amortiguado de 600 ms. Usa la cuadrícula sin transformar como referencia y compensa la distancia de la llave; observar el sprite transformado directamente podría medir su posición original al fondo de la escena. La marca de sesión `bitty-stack-tap-discovered-v1` evita repetir ese pop automáticamente al navegar. Entrar, volver o recargar **nunca inicia la inundación**.

La imagen de la llave es un botón: sin texto visible «Abrir llave», pero con nombre accesible «Activar la inundación» y contorno de foco. Se puede activar con clic, toque, Enter o espacio.

Hover, foco y toque seleccionan una tecnología. Las poses existentes se superponen con un fundido de 200 ms y un desplazamiento de solo 3 px. Bitty se muestra en el margen reservado a la altura de la palabra seleccionada, no encima del texto; al salir o pulsar Escape recupera su aspecto normal. La lista muestra solo los nombres, sin descripciones ni notas debajo. Las frases de uso se conservan como descripción accesible y en la reacción de Bitty. El enlace de GitHub es independiente para que consultar la reacción no fuerce la navegación.

El estado `activeTechnology` es independiente de `phase`. Al comenzar la escena se limpia la selección y se ignoran temporalmente nuevos cambios de pose, sin desactivar la información ni los enlaces.

## Timeline al pulsar la imagen

| Etiqueta | Tiempo | Acción |
| --- | --- | --- |
| `openTap` | 0 s | Bitty se prepara, hace fuerza y suelta la rueda con un pequeño retroceso. |
| `fill` | 0.85 s | Se despliega el chorro y sube el agua detrás del contenido. |
| `sweptAway` | 2.05 s | Tras intentar resistir y decir «Yo controlo—», la corriente acelera hacia la izquierda. |
| `whaleReturn` | 3.25 s | Crucero continuo, balanceo suave y estela; la ballena frena solo al llegar. |
| `closeTap` | 5.1 s | Fundido de la ballena y pequeño salto de Bitty hacia la llave antes de cerrarla. |
| `drain` | 5.9 s | El mar desciende y las palabras se asientan de forma escalonada. |
| final | 7 s | Bitty normal y «Docker lo tenía bajo control. Más o menos.»; vuelve la exploración. |

La superficie usa el mismo PNG en dos capas independientes que se desplazan lentamente en sentidos opuestos. Un degradado funde la cresta con el cuerpo del agua sin borde horizontal duro. Tres pequeñas gotas acompañan la estela. Todo pertenece a la misma timeline finita: ni CSS infinito ni animación de `background-position`. Las palabras inferiores flotan primero, y la estela reacciona según la posición horizontal real de cada palabra. `will-change` solo se aplica mientras la escena está activa.

Se animan bloques completos, nunca letras individuales: hasta 12 px y 3 grados, con reacciones escalonadas. Los 20 bloques animados (nombres y títulos de categoría) terminan con x/y/rotación cero. No hay cambios de orden ni dimensiones animadas, pinning o scrubbing.

Se conserva el nivel alto solicitado: la cresta alcanza 36 px por encima de la cuadrícula y permanece detrás del texto. La llave mide 186 × 124 px en escritorio y 136 × 91 px en móvil. Su salida está a la izquierda (18% del ancho, 91% de la altura); el largo del chorro se calcula desde allí hasta el borde inferior de la sección. La capa del sprite mide 320 px de ancho, 240 px en móvil, para compensar sus márgenes transparentes. Un contenedor recorta el pequeño margen vertical sin editar la imagen.

## Saltar, repetir y accesibilidad

«Saltar» lleva la timeline a su final, detiene el agua, restaura las palabras y devuelve el foco a la llave si estaba en el botón que desaparece. Al terminar aparece «Repetir», que crea una timeline nueva con medidas actualizadas y mata la anterior. Un guard síncrono evita activaciones duplicadas antes de que React vuelva a renderizar.

Scroll, enlaces y teclado siguen funcionando. Las capas gráficas no capturan el puntero; solo lo hace el botón de la llave. Los sprites, agua, chorro, estela y frases decorativas tienen `aria-hidden` o alt vacío. Las descripciones están asociadas a los controles y el mensaje principal es un estado accesible.

Salir de la sección, ocultar la pestaña, redimensionar o activar movimiento reducido completa una escena en curso. Con `prefers-reduced-motion` no hay pop, fundidos, agua ni desplazamientos largos: pulsar la llave muestra directamente el desenlace. Los controles y las reacciones estáticas siguen disponibles. Si falla un recurso de la inundación, la llave queda desactivada con explicación; el contenido y la exploración permanecen disponibles.

`useGSAP` limita los efectos al componente y revierte sus estilos al desmontar. Se limpian timeline, ScrollTrigger, listeners de scroll/resize/visibility/media y handlers de imágenes. El flag `active` descarta precargas del primer montaje de Strict Mode. No hay timers ni animaciones infinitas. El asistente global se mantiene recogido en esta sección, sin duplicar a Bitty.

## Recursos

Se integraron los PNG proporcionados sin alterar sus píxeles:

- `public/assets/bitty-tap-left.png`: llave orientada a la izquierda.
- `public/assets/bitty-swept-left.png`: Bitty arrastrado por el agua hacia la izquierda.

Se reutilizan `bitty-tap-turn.png`, `bitty-tap-oops.png`, `bitty-tap-stream.png`, `bitty-cobalt-sea.png`, `bitty-whale-wave.png`, `bitty-stand.png`, `bitty-nav-wink.png` y `bitty-nav-github-kiss.png`. Este último es la variante con orejas y cola de gato. Para el resto se usan poses compatibles, no atuendos inventados.

**No falta ningún recurso obligatorio.** Como mejora opcional: añadir `public/assets/bitty-tap-left-open.png`, exportado sobre el mismo canvas que la llave izquierda, para distinguir también el estado abierto en el dibujo. Actualmente las dos capas usan la misma llave con una variación de brillo; el movimiento y el chorro indican la apertura. Una ballena sola (`bitty-whale-only.png`) y una pose de bajada (`bitty-whale-disembark.png`) permitirían reemplazar el fundido del regreso por un descenso dibujado.

## Verificación

Pruebas automatizadas y build con los scripts existentes. Recorridos de navegador en 1440/768/390/320 px: entrada sin activación, hover/toque/foco, enlace real de GitHub, inicio con Enter, salto y foco, repetición completa, recorrido de ballena hacia la derecha, salida de la sección, restauración del texto y ausencia de overflow o saltos de geometría. También movimiento reducido. El sitio no se publica.

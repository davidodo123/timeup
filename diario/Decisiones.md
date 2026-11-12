---
tags: [decisiones]
---
# Decisiones

Qué se decidió, por qué y cuándo. No se borra: si algo cambia, se añade una entrada nueva.

## Stack: Expo + React Native
**2026-11-12.** Expo (React Native) con TypeScript, frente a Flutter o nativo (Swift/Kotlin). Un solo código para iOS y Android, se prueba al momento en el móvil con Expo Go y se publica con EAS sin Xcode ni Android Studio.

## Nombre: Tres Rondas
**2026-11-12.** La app se llama *Tres Rondas* y no usa el nombre del juego de mesa en que se inspira, que es una marca registrada. La mecánica (mismo mazo en tres rondas: describir, una palabra, mímica) sí se puede usar.

## Estado: reducer puro con Context
**2026-11-12.** `useReducer` + Context en vez de Redux o Zustand. Sin dependencias extra y el motor se prueba sin mocks: el tiempo (`now`) y el azar (órdenes ya barajados) entran en las acciones. Los órdenes de las rondas 2 y 3 se barajan al empezar la partida.

## Una sola ruta para la partida
**2026-11-12.** Toda la partida vive en `/partida` y la pantalla depende de la fase (`turnIntro`, `playing`, `turnReview`, `roundEnd`, `finished`). Así el botón atrás no puede dejar el juego a medias; en Android pregunta antes de salir.

## Pasar una carta
**2026-11-12.** La carta pasada va al fondo del mazo para que no vuelva a salir justo después. Configurable: sin penalización o −1 punto por pase.

## Revisión del rival
**2026-11-12.** Al acabar el turno, el equipo rival ve las cartas acertadas y puede anular las que no valgan. Las anuladas vuelven al mazo y no puntúan.

## Arrastrar el tiempo sobrante
**2026-11-12.** Regla clásica: si un jugador vacía el mazo con tiempo de sobra, empieza la ronda siguiente con ese tiempo. Solo si sobran 3 s o más, y se puede desactivar.

## Temporizador por marcas de tiempo
**2026-11-12.** La cuenta atrás calcula `endsAt - ahora` en vez de restar cada segundo: no se desfasa si el móvil va cargado. La pausa mueve `endsAt` y también el cronómetro de la carta, para que las estadísticas de velocidad sean justas.

## Versión web en Vercel
**2026-11-12.** La app también se publica como web estática en Vercel (`npx expo export --platform web` → `dist/`, todo en una sola página con `web.output: "single"` y reescritura a `index.html`). Sirve para jugar desde el navegador del móvil sin instalar nada. Limitaciones: en iPhone (Safari) no hay vibración; en Android (Chrome) sí. Las apps nativas siguen siendo la Fase 3.

## Rediseño: la carta como motivo
**2026-11-12.** La identidad visual sale del propio juego, no de una plantilla:
- **La carta**: la palabra va en una carta de papel crema con tinta oscura en los dos temas (se lee mejor a distancia que texto claro sobre fondo oscuro). Debajo asoman los bordes del mazo que queda. Es el único elemento con sombra, porque es lo único que "flota".
- **Las tres rondas** como tres cartitas numeradas: en la portada explican el juego y durante la partida dicen en qué ronda estás.
- **Tipografía Bricolage Grotesque** (Google Fonts, licencia OFL): grotesca con carácter de cartel, muy legible en grande. Sustituye a la fuente del sistema.
- **Paleta corta**: fondo tinta o crema, amarillo solo para el botón que hace avanzar el juego, verde/rojo solo para acertar/pasar, y el color de cada equipo en su pantalla de turno.
- **Movimiento con propósito**: la carta nueva sube del mazo, sellos «¡SÍ!»/«PASO» al deslizar y el podio se revela de abajo arriba. Nada en bucle.

## Sonidos generados por script
**2026-11-12.** Alarma, acierto, pase y tic se generan con `npm run sounds` (`scripts/generate-sounds.mjs`). Sin archivos de audio de terceros ni licencias.

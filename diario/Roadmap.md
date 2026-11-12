---
tags: [roadmap]
---
# Roadmap

Regla: se trabaja **una fase cada vez** y no se pasa a la siguiente hasta que David la comprueba.

Leyenda: `[x]` hecho · `[ ]` pendiente · `[/]` empezado · `[-]` descartado

## Fase 1 · Necesario
- [x] Proyecto Expo SDK 58 + TypeScript + Expo Router → [[Decisiones#Stack: Expo + React Native]]
- [x] Modelo de datos y motor del juego puro, con tests → [[Decisiones#Estado: reducer puro con Context]]
- [x] Base de cartas local: 6 categorías × 40 cartas
- [x] Configuración: equipos y jugadores, categorías, segundos por turno, número de cartas, modo de pase
- [x] Temporizador por marcas de tiempo, con pausa (también al salir de la app)
- [x] Tres rondas con el mismo mazo barajado de nuevo; arrastre del tiempo sobrante → [[Decisiones#Arrastrar el tiempo sobrante]]
- [x] Turno: carta grande, deslizar o botones verde/rojo, pasar al fondo del mazo
- [x] Fin de turno: alarma y revisión del equipo rival, que puede anular cartas → [[Decisiones#Revisión del rival]]
- [x] Vibración al acertar/pasar y fuerte en los 5 últimos segundos; sonidos generados → [[Decisiones#Sonidos generados por script]]
- [x] Podio, marcador por rondas y estadísticas divertidas
- [x] Modo oscuro / claro / automático
- [x] Subir el código a GitHub (`davidodo123/timeup`)
- [x] Versión web lista para Vercel (export estático) → [[Decisiones#Versión web en Vercel]]
- [ ] Importar el repo en Vercel y comprobar que la web carga (David)
- [ ] Probar una partida completa en un móvil real con Expo Go (David)

## Fase 2 · Importante
- [ ] Guardar la partida en curso por si se cierra la app
- [ ] Recordar equipos y ajustes de la última partida
- [ ] Cartas propias: cada jugador escribe sus palabras antes de empezar
- [ ] Ampliar la base de cartas (mínimo 80 por categoría)
- [ ] Icono y pantalla de carga propios

## Fase 3 · Publicación
- [ ] Build de Android con EAS
- [ ] Ficha en Google Play
- [ ] Build de iOS y TestFlight

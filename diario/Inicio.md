---
tags: [inicio]
---
# Tres Rondas

Party game para móvil de adivinar palabras por equipos, con la dinámica de pasarse el móvil. Las mismas cartas se juegan en tres rondas: descripción libre, una sola palabra y mímica.

**Para quién:** grupos de amigos o familia en una fiesta o una cena, con un solo móvil.

## Enlaces
- Repo: https://github.com/davidodo123/timeup
- Web: en Vercel (URL pendiente al importar el repo)
- Móvil: se prueba con Expo Go (`npm start` y escanear el QR)

## Fase actual
Fase 1 · Necesario: base jugable completa y subida a GitHub. Falta desplegar en Vercel y que David pruebe una partida entera.

## Cómo está hecho
- Expo SDK 58 + React Native + TypeScript, rutas con Expo Router
- Motor del juego puro en `src/game/` (reducer + tests en `src/game/__tests__/`)
- Pantallas en `src/screens/`, piezas reutilizables en `src/components/`
- Ver [[Decisiones]] y [[Configuración]]

## Cómo usamos el diario
- [[Roadmap]]: fases y tareas con casillas. Una fase cada vez.
- [[Ideas]]: bandeja de entrada sin ordenar.
- [[Decisiones]]: qué se decidió y por qué. No se borra, se añade.
- `Diario/`: una nota por día de trabajo.

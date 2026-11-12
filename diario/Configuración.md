---
tags: [configuracion]
---
# Configuración

Aquí van servicios, despliegue y nombres de variables. **Nunca valores secretos.**

## App
- Nombre: Tres Rondas · slug `tres-rondas` · esquema `tresrondas://`
- Android `com.davidodo.tresrondas` · iOS `com.davidodo.tresrondas`
- Expo SDK 58, React Native 0.88, React 19.3

## Comandos
- `npm start`: servidor de desarrollo (escanear el QR con Expo Go)
- `npm test`: tests del motor
- `npm run typecheck`: TypeScript
- `npx expo lint`: linter
- `npm run sounds`: regenerar los sonidos de `assets/sounds/`

## Variables de entorno
Ninguna por ahora.

## Despliegue
Pendiente: EAS Build para Android e iOS (Fase 3).

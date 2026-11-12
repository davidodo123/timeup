import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Options {
  /** Momento en que acaba la cuenta atrás. `null` = parada. */
  endsAt: number | null;
  /** Si está en pausa, momento en que se pausó. */
  pausedAt: number | null;
  /** Se llama una sola vez al llegar a 0. */
  onExpire: () => void;
  /** Se llama cada vez que cambia el segundo visible (40, 39, 38…). */
  onSecond?: (secondsLeft: number) => void;
  intervalMs?: number;
}

const remaining = (endsAt: number | null, pausedAt: number | null) =>
  endsAt === null ? 0 : Math.max(0, endsAt - (pausedAt ?? Date.now()));

/**
 * Cuenta atrás basada en marcas de tiempo, no en ir restando: no acumula
 * desfase aunque el hilo JS vaya cargado, y la pausa la gestiona el estado.
 * Devuelve los milisegundos que quedan.
 */
export function useCountdown({ endsAt, pausedAt, onExpire, onSecond, intervalMs = 100 }: Options) {
  const [remainingMs, setRemainingMs] = useState(() => remaining(endsAt, pausedAt));

  // Refs para no reiniciar el intervalo cada vez que cambian los callbacks.
  const callbacks = useRef({ onExpire, onSecond });
  useLayoutEffect(() => {
    callbacks.current = { onExpire, onSecond };
  });

  const lastSecond = useRef<number | null>(null);
  const expired = useRef(false);

  useEffect(() => {
    // Un `endsAt` nuevo es un turno nuevo (o una reanudación): se puede volver a expirar.
    expired.current = false;
  }, [endsAt]);

  useEffect(() => {
    const running = endsAt !== null && pausedAt === null;
    const tick = () => {
      const ms = remaining(endsAt, pausedAt);
      setRemainingMs(ms);
      const sec = Math.ceil(ms / 1000);
      if (sec !== lastSecond.current) {
        lastSecond.current = sec;
        if (running) callbacks.current.onSecond?.(sec);
      }
      if (ms <= 0 && running && !expired.current) {
        expired.current = true;
        callbacks.current.onExpire();
      }
    };
    tick();
    if (!running) return;
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [endsAt, pausedAt, intervalMs]);

  return remainingMs;
}

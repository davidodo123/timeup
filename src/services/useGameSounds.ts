import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useCallback, useEffect, useMemo } from 'react';

const SOURCES = {
  alarm: require('../../assets/sounds/alarm.wav'),
  guess: require('../../assets/sounds/guess.wav'),
  pass: require('../../assets/sounds/pass.wav'),
  tick: require('../../assets/sounds/tick.wav'),
};

export type SoundName = keyof typeof SOURCES;

/** Sonidos precargados del turno. `play` reinicia el sonido si ya estaba sonando. */
export function useGameSounds() {
  const alarm = useAudioPlayer(SOURCES.alarm);
  const guess = useAudioPlayer(SOURCES.guess);
  const pass = useAudioPlayer(SOURCES.pass);
  const tick = useAudioPlayer(SOURCES.tick);
  const players = useMemo<Record<SoundName, AudioPlayer>>(
    () => ({ alarm, guess, pass, tick }),
    [alarm, guess, pass, tick],
  );

  useEffect(() => {
    // La alarma tiene que oírse aunque el iPhone esté en silencio.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      const p = players[name];
      p.seekTo(0)
        .then(() => p.play())
        .catch(() => undefined);
    },
    [players],
  );

  return { play };
}

import { Redirect, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { PlayScreen } from '../screens/PlayScreen';
import { PodiumScreen } from '../screens/PodiumScreen';
import { RoundEndScreen } from '../screens/RoundEndScreen';
import { TurnIntroScreen } from '../screens/TurnIntroScreen';
import { TurnReviewScreen } from '../screens/TurnReviewScreen';
import { useGame, useGameActions } from '../state/GameProvider';

/**
 * Una sola ruta para toda la partida: la pantalla depende de la fase del
 * estado. Así el botón "atrás" no puede dejar el juego en un estado imposible.
 */
export default function GameRoute() {
  useKeepAwake();
  const { phase } = useGame();
  const { pause, reset } = useGameActions();
  const router = useRouter();

  // Atrás en Android: pausa y pregunta antes de abandonar la partida.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      pause();
      Alert.alert('¿Salir de la partida?', 'Se perderá el marcador.', [
        { text: 'Seguir jugando', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            reset();
            router.replace('/');
          },
        },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [pause, reset, router]);

  switch (phase) {
    case 'setup':
      return <Redirect href="/" />;
    case 'turnIntro':
      return <TurnIntroScreen />;
    case 'playing':
      return <PlayScreen />;
    case 'turnReview':
      return <TurnReviewScreen />;
    case 'roundEnd':
      return <RoundEndScreen />;
    case 'finished':
      return <PodiumScreen />;
  }
}

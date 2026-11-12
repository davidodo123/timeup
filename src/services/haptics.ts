import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

// En web y en algunos Android sin motor háptico, expo-haptics falla: se ignora.
const safe = (p: Promise<void>) => p.catch(() => undefined);

export const haptics = {
  guess() {
    safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },
  pass() {
    safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  },
  /** Cada segundo de los 5 últimos: golpe fuerte. */
  warning() {
    safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
    if (Platform.OS === 'android') Vibration.vibrate(120);
  },
  /** Fin del turno: vibración larga e intensa. */
  timeUp() {
    safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    Vibration.vibrate(Platform.OS === 'android' ? [0, 500, 150, 500] : 400);
  },
  tap() {
    safe(Haptics.selectionAsync());
  },
};

import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider } from '../state/GameProvider';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });

  // Si la fuente falla, se sigue con la del sistema en vez de dejar la app en blanco.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <ThemeProvider>
          <GameProvider>
            <ThemedStack />
          </GameProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStack() {
  const { colors, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        {/* En partida no se puede volver atrás deslizando: se perdería el turno. */}
        <Stack.Screen name="partida" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });

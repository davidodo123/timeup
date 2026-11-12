import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  /** Botón principal. Solo para la acción que hace avanzar el juego. */
  primary: string;
  onPrimary: string;
  success: string;
  danger: string;
  onColor: string;
  /** La carta de juego: papel crema con tinta oscura en los dos temas. */
  card: string;
  cardInk: string;
  cardMuted: string;
  cardEdge: string;
}

const dark: Palette = {
  bg: '#13101D',
  surface: '#1F1A2E',
  surfaceAlt: '#2B2540',
  border: '#3B3457',
  text: '#FFF8EE',
  textMuted: '#B9B1CD',
  primary: '#FFC233',
  onPrimary: '#1C1405',
  success: '#17B866',
  danger: '#F2445A',
  onColor: '#FFFFFF',
  card: '#FFF3DE',
  cardInk: '#1B1427',
  cardMuted: '#6E6380',
  cardEdge: '#E9D9BC',
};

const light: Palette = {
  bg: '#FBF3E6',
  surface: '#FFFFFF',
  surfaceAlt: '#F2E6D3',
  border: '#E3D2BA',
  text: '#1B1427',
  textMuted: '#625875',
  primary: '#FFB800',
  onPrimary: '#1C1405',
  success: '#0E9F55',
  danger: '#E0263F',
  onColor: '#FFFFFF',
  card: '#FFFFFF',
  cardInk: '#1B1427',
  cardMuted: '#6E6380',
  cardEdge: '#E3D2BA',
};

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeValue {
  colors: Palette;
  isDark: boolean;
  mode: ThemeMode;
  setMode(mode: ThemeMode): void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const isDark = mode === 'system' ? system !== 'light' : mode === 'dark';
  const value = useMemo(
    () => ({ colors: isDark ? dark : light, isDark, mode, setMode }),
    [isDark, mode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}

/**
 * Bricolage Grotesque: grotesca con carácter de cartel, muy legible en grande.
 * En React Native el peso va en la familia, no en `fontWeight`.
 */
export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  bold: 'BricolageGrotesque_700Bold',
  semibold: 'BricolageGrotesque_600SemiBold',
  body: 'BricolageGrotesque_400Regular',
} as const;

/** Tamaños de letra pensados para leer el móvil a un metro de distancia. */
export const type = {
  hero: 56,
  title: 36,
  heading: 24,
  body: 18,
  small: 15,
} as const;

export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 36 } as const;
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

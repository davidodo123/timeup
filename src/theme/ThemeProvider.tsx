import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  success: string;
  danger: string;
  warning: string;
  onColor: string;
}

const dark: Palette = {
  bg: '#0F0D1A',
  surface: '#1C1930',
  surfaceAlt: '#2A2644',
  border: '#3A3558',
  text: '#FFFFFF',
  textMuted: '#B3AECB',
  primary: '#FFB703',
  onPrimary: '#1A1300',
  accent: '#8B5CF6',
  success: '#22C55E',
  danger: '#F43F5E',
  warning: '#FB923C',
  onColor: '#FFFFFF',
};

const light: Palette = {
  bg: '#FFF7EC',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EADF',
  border: '#E4D6C5',
  text: '#1B1530',
  textMuted: '#5E5872',
  primary: '#F59E0B',
  onPrimary: '#1A1300',
  accent: '#7C3AED',
  success: '#16A34A',
  danger: '#E11D48',
  warning: '#EA580C',
  onColor: '#FFFFFF',
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

/** Tamaños de letra pensados para leer el móvil a un metro de distancia. */
export const type = {
  hero: 56,
  title: 34,
  heading: 24,
  body: 18,
  small: 15,
} as const;

export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 36 } as const;
export const radius = { md: 14, lg: 22, pill: 999 } as const;

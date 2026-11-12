/** Luminancia relativa WCAG de un color hex (#RRGGBB). */
function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** Texto blanco o casi negro, el que más contraste tenga sobre `background`. */
export function readableInk(background: string): string {
  const l = luminance(background);
  const onWhite = 1.05 / (l + 0.05);
  const onDark = (l + 0.05) / 0.05;
  return onWhite >= onDark ? '#FFFFFF' : '#14101F';
}

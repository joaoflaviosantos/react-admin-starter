const HEX_COLOR_PATTERN = /^#?[0-9a-fA-F]{6}$/;

export function normalizeHexColor(value: string, fallback = '#0068a8'): string {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return HEX_COLOR_PATTERN.test(withHash) ? withHash.toLowerCase() : fallback;
}

/** Converts `#rrggbb` to the CSS HSL tuple format used by design tokens (`H S% L%`). */
export function hexToHslCss(hex: string): string {
  const normalized = normalizeHexColor(hex).slice(1);
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  const lightness = (max + min) / 2;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }

    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

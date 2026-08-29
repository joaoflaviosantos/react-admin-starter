import { describe, expect, it } from 'vitest';

import { hexToHslCss, normalizeHexColor } from './color-utils';

describe('color-utils', () => {
  it('normalizes hex colors with or without hash', () => {
    expect(normalizeHexColor('0068a8')).toBe('#0068a8');
    expect(normalizeHexColor('#0068A8')).toBe('#0068a8');
  });

  it('falls back for invalid hex colors', () => {
    expect(normalizeHexColor('invalid')).toBe('#0068a8');
  });

  it('converts sky primary hex to hsl css tuple', () => {
    expect(hexToHslCss('#0068a8')).toBe('203 100% 33%');
  });
});

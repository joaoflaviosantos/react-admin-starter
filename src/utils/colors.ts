/**
 * Generates a hash code from a given string.
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = Math.imul(31, hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
};

/**
 * Converts a numerical hash code to a hexadecimal color code.
 */
const intToRGB = (hash: number): string => {
  let hex = hash.toString(16);
  while (hex.length < 6) {
    hex = `0${hex}`;
  }
  return `#${hex.substring(0, 6)}`;
};

/**
 * Generates a color code based on the provided name by hashing the name and converting it to a color.
 */
export const getColorFromName = (name: string): string => {
  const hash = hashCode(name);
  return intToRGB(hash);
};

/**
 * Converts a hexadecimal color code to an RGBA color string.
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const sanitizedHex = hex.replace('#', '');

  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

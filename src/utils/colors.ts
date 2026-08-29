export const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = Math.imul(31, hash) + name.charCodeAt(i);
  }
  hash = Math.abs(hash);
  let hex = hash.toString(16);
  while (hex.length < 6) {
    hex = `0${hex}`;
  }
  return `#${hex.substring(0, 6)}`;
};

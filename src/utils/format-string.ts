export const getInitials = (name: string, max: number = 4) => {
  let count = 0;
  return name
    .split(' ')
    .map((part) => {
      if (part.length >= 1 && count < max) {
        count += 1;
        return part.charAt(0).toUpperCase();
      }
      return '';
    })
    .join('');
};

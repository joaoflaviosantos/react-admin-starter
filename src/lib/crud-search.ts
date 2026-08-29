export function normalizeCrudSearchValues<T extends Record<string, unknown>>(fields: T) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (key === 'is_active') {
          return [key, value === 'true' || value === true];
        }
        return [key, value];
      }),
  );
}

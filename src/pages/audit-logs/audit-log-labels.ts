import type { TFunction } from 'i18next';

const fallbackLabel = (value: string) => {
  const label = value.replace(/[._]/g, ' ').trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const actionLabel = (action: string, t: TFunction) => {
  const key = action.replace(/\./g, '_');
  const label = t(`app.auditLogs.actions.${key}`, { defaultValue: '' });
  return label || fallbackLabel(action);
};

export const resourceLabel = (resource: string, t: TFunction) =>
  t(`app.auditLogs.resourceTypes.${resource}`, { defaultValue: fallbackLabel(resource) });

import { describe, expect, it } from 'vitest';

import { ADMIN_PERMISSIONS } from '@/api/mock/permissions';
import enUS from '@/locales/lang/en_US/common.json';
import ptBR from '@/locales/lang/pt_BR/common.json';
import { flattenTrees } from '@/utils/tree';

function translationFor(dictionary: object, key: string): unknown {
  return key.split('.').reduce<unknown>((value, segment) => {
    if (typeof value !== 'object' || value === null) return undefined;
    return (value as Record<string, unknown>)[segment];
  }, dictionary);
}

describe('App menu translations', () => {
  it.each([
    ['pt_BR', ptBR],
    ['en_US', enUS],
  ])('translates every app permission label in %s', (_locale, dictionary) => {
    const workbench = ADMIN_PERMISSIONS.find((permission) => permission.route === 'workbench');
    const labels = flattenTrees(workbench?.children ?? [])
      .filter((permission) => permission.label.startsWith('app.'))
      .map((permission) => permission.label);

    expect(labels).not.toHaveLength(0);
    expect(labels.every((label) => typeof translationFor(dictionary, label) === 'string')).toBe(
      true,
    );
  });

  it('uses registered Iconify icons for the app catalogues', () => {
    const workbench = ADMIN_PERMISSIONS.find((permission) => permission.route === 'workbench');
    const catalogues = flattenTrees(workbench?.children ?? []).filter((permission) =>
      permission.children?.some((child) => child.label.startsWith('app.')),
    );

    expect(catalogues.every((permission) => permission.icon?.startsWith('mdi:'))).toBe(true);
  });
});

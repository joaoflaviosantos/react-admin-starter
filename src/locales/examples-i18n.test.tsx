import { act, render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import i18n from './i18n';
import enUS from './lang/en_US/common.json';
import ptBR from './lang/pt_BR/common.json';

const exampleSources = import.meta.glob('../pages/examples/**/*.{ts,tsx}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

function LanguageProbe() {
  const { t } = useTranslation();
  return <p>{t('examples.customers.description')}</p>;
}

const removedNamespaces = ['chat', 'mailbox', 'tasks', 'notes', 'scrum', 'contacts', 'calendar'];
const requiredVisibleKeys = [
  'examples.menu.customers',
  'examples.menu.revenue',
  'examples.menu.subscriptions',
  'examples.menu.invoices',
  'examples.menu.support',
  'examples.menu.tickets',
  'examples.menu.platform',
  'examples.menu.apiKeys',
  'examples.menu.auditLogs',
  'examples.dataView.table',
  'examples.dataView.grid',
  'examples.dataView.list',
  'examples.dataView.loading',
  'examples.dataView.empty',
  'examples.dataView.error',
  'examples.common.options.draft',
  'examples.common.options.sent',
  'examples.customers.description',
  'examples.customers.empty',
  'examples.subscriptions.empty',
  'examples.tickets.empty',
  'examples.apiKeys.secretOnce',
  'examples.auditLogs.empty',
];

describe('Examples localization', () => {
  it('keeps every Examples resource key present and resolved in both languages', () => {
    const englishKeys = flatten(enUS.examples, 'examples');
    const portugueseKeys = flatten(ptBR.examples, 'examples');

    expect(portugueseKeys.sort()).toEqual(englishKeys.sort());
    for (const language of ['en_US', 'pt_BR']) {
      for (const key of englishKeys) {
        expect(i18n.exists(key, { lng: language }), `${language}: ${key}`).toBe(true);
        expect(i18n.t(key, { lng: language }), `${language}: ${key}`).not.toBe(key);
      }
    }
  });

  it('resolves every literal Examples key referenced by a page', () => {
    const referencedKeys = Object.values(exampleSources).flatMap((source) =>
      [...source.matchAll(/\bt\(\s*['"](examples\.[^'"]+)['"]/g)].map((match) => match[1]),
    );

    expect(referencedKeys.length).toBeGreaterThan(50);
    for (const key of new Set(referencedKeys)) {
      expect(i18n.exists(key, { lng: 'en_US' }), key).toBe(true);
      expect(i18n.exists(key, { lng: 'pt_BR' }), key).toBe(true);
    }
  });

  it('contains SaaS visible, aria, validation, toast and empty-state copy without old namespaces', () => {
    for (const namespace of removedNamespaces) {
      expect(enUS.examples).not.toHaveProperty(namespace);
      expect(ptBR.examples).not.toHaveProperty(namespace);
      expect(enUS.examples.menu).not.toHaveProperty(namespace);
      expect(ptBR.examples.menu).not.toHaveProperty(namespace);
    }

    for (const language of ['en_US', 'pt_BR']) {
      for (const key of requiredVisibleKeys) {
        expect(i18n.exists(key, { lng: language }), `${language}: ${key}`).toBe(true);
        expect(i18n.t(key, { lng: language }), `${language}: ${key}`).not.toBe(key);
      }
    }
  });

  it('updates visible copy when the language changes without a reload', async () => {
    render(<LanguageProbe />);
    expect(
      screen.getByText('Manage customer health, revenue and product adoption.'),
    ).toBeInTheDocument();

    await act(() => i18n.changeLanguage('pt_BR'));

    expect(
      screen.getByText('Gerencie saúde, receita e adoção do produto pelos clientes.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('examples.customers.description')).not.toBeInTheDocument();
  });
});

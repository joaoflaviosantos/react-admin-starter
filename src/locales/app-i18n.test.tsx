import { act, render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { describe, expect, it } from 'vitest';

import i18n from './i18n';
import enUS from './lang/en_US/common.json';
import ptBR from './lang/pt_BR/common.json';

const sources = import.meta.glob(
  [
    '../pages/{api-keys,audit-logs,customers,invoices,subscriptions,tickets}/**/*.tsx',
    '../pages/workbench/overview/index.tsx',
    '!../pages/**/*.test.tsx',
  ],
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
) as Record<string, string>;

function flatten(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

function LanguageProbe() {
  const { t } = useTranslation();
  return <p>{t('app.customers.description')}</p>;
}

const removedNamespaces = ['chat', 'mailbox', 'tasks', 'notes', 'scrum', 'contacts', 'calendar'];
const requiredVisibleKeys = [
  'app.menu.customers',
  'app.menu.revenue',
  'app.menu.subscriptions',
  'app.menu.invoices',
  'app.menu.support',
  'app.menu.tickets',
  'app.menu.platform',
  'app.menu.apiKeys',
  'app.menu.auditLogs',
  'app.dataView.table',
  'app.dataView.grid',
  'app.dataView.list',
  'app.dataView.loading',
  'app.dataView.empty',
  'app.dataView.error',
  'app.common.options.draft',
  'app.common.options.sent',
  'app.customers.description',
  'app.customers.empty',
  'app.subscriptions.empty',
  'app.tickets.empty',
  'app.apiKeys.secretOnce',
  'app.auditLogs.empty',
];

describe('App localization', () => {
  it('keeps every app resource key present and resolved in both languages', () => {
    const englishKeys = flatten(enUS.app, 'app');
    const portugueseKeys = flatten(ptBR.app, 'app');

    expect(portugueseKeys.sort()).toEqual(englishKeys.sort());
    for (const language of ['en_US', 'pt_BR']) {
      for (const key of englishKeys) {
        expect(i18n.exists(key, { lng: language }), `${language}: ${key}`).toBe(true);
        expect(i18n.t(key, { lng: language }), `${language}: ${key}`).not.toBe(key);
      }
    }
  });

  it('resolves every literal app key referenced by a page', () => {
    const referencedKeys = Object.values(sources).flatMap((source) =>
      [...source.matchAll(/\bt\(\s*['"](app\.[^'"]+)['"]/g)].map((match) => match[1]),
    );

    expect(referencedKeys.length).toBeGreaterThan(50);
    for (const key of new Set(referencedKeys)) {
      expect(i18n.exists(key, { lng: 'en_US' }), key).toBe(true);
      expect(i18n.exists(key, { lng: 'pt_BR' }), key).toBe(true);
    }
  });

  it('contains SaaS visible, aria, validation, toast and empty-state copy without old namespaces', () => {
    for (const namespace of removedNamespaces) {
      expect(enUS.app).not.toHaveProperty(namespace);
      expect(ptBR.app).not.toHaveProperty(namespace);
      expect(enUS.app.menu).not.toHaveProperty(namespace);
      expect(ptBR.app.menu).not.toHaveProperty(namespace);
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
    expect(screen.queryByText('app.customers.description')).not.toBeInTheDocument();
  });
});

import type { ExamplesDomainHandler } from './domains';
import { getState } from '../../store';
import { paginate, readPagination } from './shared';

const baseUrl = '/v1/examples/platform/audit-logs';

const safeMetadata = (metadata: Record<string, string | number | boolean | null>) =>
  Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !/(secret|token|password|credential)/i.test(key)),
  );

export const handleAuditLogsRequest: ExamplesDomainHandler = ({ config, method, pathname }) => {
  if (method !== 'GET' || pathname !== baseUrl) return pathname === baseUrl ? null : null;
  const params = config.params as Record<string, unknown> | undefined;
  const search = String(params?.search ?? '')
    .trim()
    .toLowerCase();
  const actor = String(params?.actor ?? '')
    .trim()
    .toLowerCase();
  const action = String(params?.action ?? '')
    .trim()
    .toLowerCase();
  const resource = String(params?.resource ?? '')
    .trim()
    .toLowerCase();
  const from = String(params?.from ?? '');
  const to = String(params?.to ?? '');
  const filtered = getState()
    .examples.auditLogs.filter((event) => {
      const haystack =
        `${event.summary} ${event.actorName} ${event.actorEmail} ${event.action} ${event.resourceType} ${event.resourceId}`.toLowerCase();
      const created = Date.parse(event.createdAt);
      return (
        (!search || haystack.includes(search)) &&
        (!actor || `${event.actorName} ${event.actorEmail}`.toLowerCase().includes(actor)) &&
        (!action || event.action.toLowerCase().includes(action)) &&
        (!resource || event.resourceType.toLowerCase() === resource) &&
        (!from || created >= Date.parse(`${from}T00:00:00Z`)) &&
        (!to || created <= Date.parse(`${to}T23:59:59Z`))
      );
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((event) => ({ ...structuredClone(event), metadata: safeMetadata(event.metadata) }));
  const { page, itemsPerPage } = readPagination(config);
  return { status: 200, data: paginate(filtered, page, itemsPerPage) };
};

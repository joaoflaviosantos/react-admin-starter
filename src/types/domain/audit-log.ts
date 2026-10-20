export type AuditLogMetadata = Record<string, string | number | boolean | null>;

export type AuditLog = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  summary: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  metadata: AuditLogMetadata;
};

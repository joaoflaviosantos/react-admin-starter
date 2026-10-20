export type ApiKeyScope =
  | 'customers:read'
  | 'customers:write'
  | 'billing:read'
  | 'billing:write'
  | 'tickets:read'
  | 'tickets:write'
  | 'audit:read';

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
};

export type ApiKeyInput = {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt: string | null;
};

export type ApiKeyCreateResponse = {
  key: ApiKey;
  secret: string;
};

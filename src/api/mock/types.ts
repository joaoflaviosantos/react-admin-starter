import type { PermissionWithChildRead } from '#/system/user';

/** Internal mock store record — not exposed via API types. */
export type MockUserRecord = {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role_id: string;
  role: string;
  role_label: string;
  default_language: string;
  is_active: boolean;
  is_support: boolean;
  is_superuser: boolean;
  permissions: PermissionWithChildRead[];
  profile_image_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type MockRoleRecord = {
  id: string;
  name: string;
  label: string;
  description: string;
  is_active: boolean;
  is_editable: boolean;
  created_at: string;
  updated_at: string;
};

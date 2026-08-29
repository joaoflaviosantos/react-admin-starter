import { BasicStatus, PermissionType } from '#/enum';

export type UserCreate = {
  role_id?: string;
  name?: string;
  email: string;
  password?: string;
};

export type PermissionWithChildRead = {
  created_at: string;
  updated_at: string;
  parent_id?: string | null;
  is_active?: boolean | null;
  label: string;
  alternative_label?: string | null;
  is_hide?: boolean | null;
  is_tab_hide?: boolean | null;
  is_new_feature?: boolean | null;
  icon?: string | null;
  type: PermissionType;
  status?: BasicStatus;
  route: string;
  order: string;
  component?: string | null;
  frame_src?: string | null;
  name: string;
  id: string;
  actions_allowed?: Array<string> | null;
  module_name?: string | null;
  children?: Array<PermissionWithChildRead>;
};

export type UserWithPermissionsRead = {
  id: string;
  profile_image_url?: string | null;
  default_language: string;
  name: string;
  email: string;
  role: string;
  role_label: string;
  is_support: boolean;
  is_superuser: boolean;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  permissions: Array<PermissionWithChildRead> | [];
};

export type UserRead = {
  id: string;
  is_active: boolean;
  profile_image_url?: string | null;
  default_language: string;
  name: string;
  email: string;
  created_at?: string | null;
  updated_at?: string | null;
  role: string;
  role_label: string;
};

export type PaginatedListResponse_UserRead_ = {
  data: Array<UserRead>;
  total_count: number;
  has_more: boolean;
  page?: number | null;
  items_per_page?: number | null;
};

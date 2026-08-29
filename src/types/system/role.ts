export type RoleRead = {
  id: string;
  is_active: boolean;
  name: string;
  label: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
  is_editable: boolean;
};

export type RolePermissionInput = {
  permission_id: string;
  actions_allowed: string[];
};

export type RoleCreate = {
  name: string;
  label: string;
  description?: string | null;
  is_active?: boolean;
  permissions?: RolePermissionInput[] | null;
};

export type RoleUpdate = {
  name?: string;
  label?: string;
  description?: string | null;
  is_active?: boolean;
};

export type PaginatedListResponse_RoleRead_ = {
  data: Array<RoleRead>;
  total_count: number;
  has_more: boolean;
  page?: number | null;
  items_per_page?: number | null;
};

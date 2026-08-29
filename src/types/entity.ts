import { BasicStatus, PermissionType } from '#/enum';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  role?: Role;
  status?: BasicStatus;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  parent_id: string;
  name: string;
  label: string;
  alternative_label?: string;
  type: PermissionType;
  route: string;
  status?: BasicStatus;
  order?: number;
  icon?: string;
  component?: string;
  is_hide?: boolean;
  is_tab_hide?: boolean;
  frame_src?: string;
  is_new_feature?: boolean;
  children?: Permission[];
}

export interface Role {
  id: string;
  name: string;
  label: string;
  status: BasicStatus;
  order?: number;
  desc?: string;
  permission?: Permission[];
}

import apiClient from '../../apiClient';

import { PaginatedListResponse_RoleRead_, RoleRead } from '#/system/role';

export enum SystemRoleAPI {
  paginatedList = '/v1/system/roles',
  byId = '/v1/system/roles/',
}

export type SystemRoleAPISearchFormFieldType = Partial<
  Pick<RoleRead, 'name' | 'description' | 'is_active'>
>;

const getPaginatedRoleList = ({
  page = 1,
  items_per_page = 10,
  searchValues = {},
  sortFields = [],
}: {
  page?: number;
  items_per_page?: number;
  for_user_creation?: boolean;
  tenant_id?: string;
  searchValues?: SystemRoleAPISearchFormFieldType;
  sortFields?: string[];
}) =>
  apiClient.get<PaginatedListResponse_RoleRead_>({
    url: SystemRoleAPI.paginatedList,
    params: { page, items_per_page, ...searchValues, sort_by: sortFields },
  });

export default {
  getPaginatedRoleList,
};

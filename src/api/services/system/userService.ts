import apiClient from '../../apiClient';

import {
  PaginatedListResponse_UserRead_,
  UserCreate,
  UserRead,
  UserWithPermissionsRead,
} from '#/system/user';

export type MyUserTenantDataRes = UserWithPermissionsRead;

export enum SystemUserAPI {
  createOrPaginatedList = '/v1/system/users',
  byId = '/v1/system/users/',
  me = '/v1/system/users/me/',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values -- Portal uses the same path for updateMe
  updateMe = '/v1/system/users/me/',
  changePassword = '/v1/system/users/me/change-password',
  updateProfileImage = '/v1/system/users/me/profile-image',
}

export type SystemUserAPISearchFormFieldType = Partial<
  Pick<UserRead, 'name' | 'role' | 'is_active'>
>;

export interface UpdateUserInfoRequest {
  name?: string;
  email?: string;
  default_language?: string;
  is_active?: boolean;
}

const createUser = (user: UserCreate) =>
  apiClient.post<UserRead>({ url: SystemUserAPI.createOrPaginatedList, data: user });

const getPaginatedUserList = ({
  page = 1,
  items_per_page = 10,
  searchValues = {},
  sortFields = [],
}: {
  page?: number;
  items_per_page?: number;
  searchValues?: SystemUserAPISearchFormFieldType;
  sortFields?: string[];
}) =>
  apiClient.get<PaginatedListResponse_UserRead_>({
    url: SystemUserAPI.createOrPaginatedList,
    params: { page, items_per_page, ...searchValues, sort_by: sortFields },
  });

const getUserById = (id: string) =>
  apiClient.get<UserWithPermissionsRead>({ url: `${SystemUserAPI.byId}${id}` });

const updateUserById = (id: string, data: UpdateUserInfoRequest) =>
  apiClient.patch<{ message: string }>({ url: `${SystemUserAPI.byId}${id}`, data });

const deleteUserById = (id: string) =>
  apiClient.delete<{ message: string }>({ url: `${SystemUserAPI.byId}${id}` });

const getMyTenantData = async () => {
  const response = await apiClient.get<MyUserTenantDataRes>({ url: SystemUserAPI.me });
  return response;
};

export default {
  createUser,
  getPaginatedUserList,
  getUserById,
  updateUserById,
  deleteUserById,
  getMyTenantData,
};

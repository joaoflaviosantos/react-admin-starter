import { beforeEach, describe, expect, it } from 'vitest';

import { useUserStore } from './userStore';

import { StorageEnum } from '#/enum';

const mockUser = {
  id: 'user-admin',
  default_language: 'pt_BR',
  name: 'Demo Admin',
  email: 'admin@example.com',
  role: 'admin',
  role_label: 'Administrator',
  is_support: false,
  is_superuser: true,
  permissions: [],
};

describe('userStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState({
      userToken: {},
      userInfo: {},
    });
  });

  it('persists token to storage when setUserToken is called', () => {
    const { actions } = useUserStore.getState();
    actions.setUserToken({ access_token: 'mock-token-user-admin', token_type: 'bearer' });

    expect(useUserStore.getState().userToken).toEqual({
      access_token: 'mock-token-user-admin',
      token_type: 'bearer',
    });
    expect(localStorage.getItem(StorageEnum.Token)).toContain('mock-token-user-admin');
  });

  it('persists user info to storage when setUserInfo is called', () => {
    const { actions } = useUserStore.getState();
    actions.setUserInfo(mockUser);

    expect(useUserStore.getState().userInfo.email).toBe('admin@example.com');
    expect(localStorage.getItem(StorageEnum.User)).toContain('admin@example.com');
  });

  it('clearAllUserInfoAndToken removes token and user from storage', () => {
    const { actions } = useUserStore.getState();
    actions.setUserToken({ access_token: 'mock-token-user-admin', token_type: 'bearer' });
    actions.setUserInfo(mockUser);

    actions.clearAllUserInfoAndToken();

    expect(useUserStore.getState().userToken).toEqual({});
    expect(useUserStore.getState().userInfo).toEqual({});
    expect(localStorage.getItem(StorageEnum.Token)).toBeNull();
    expect(localStorage.getItem(StorageEnum.User)).toBeNull();
  });
});

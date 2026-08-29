import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { AxiosError } from 'axios';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';

import authService, { SignInReq } from '@/api/services/authService';
import userService, { MyUserTenantDataRes } from '@/api/services/system/userService';
import { getItem, removeItem, setItem } from '@/utils/storage';

import { TokenRead } from '#/auth';
import { StorageEnum } from '#/enum';

const HOMEPAGE = import.meta.env.VITE_APP_HOMEPAGE ?? '/';

type UserStore = {
  userToken: Partial<TokenRead>;
  userInfo: Partial<MyUserTenantDataRes>;
  actions: {
    setUserToken: (userToken: TokenRead) => void;
    setUserInfo: (userInfo: MyUserTenantDataRes) => void;
    clearAllUserInfoAndToken: () => void;
  };
};

export const useUserStore = create<UserStore>((set) => ({
  userToken: getItem<TokenRead>(StorageEnum.Token) ?? {},
  userInfo: getItem<MyUserTenantDataRes>(StorageEnum.User) ?? {},
  actions: {
    setUserToken: (userToken) => {
      set({ userToken });
      setItem(StorageEnum.Token, userToken);
    },
    setUserInfo: (userInfo) => {
      set({ userInfo });
      setItem(StorageEnum.User, userInfo);
    },
    clearAllUserInfoAndToken() {
      set({ userToken: {}, userInfo: {} });
      removeItem(StorageEnum.Token);
      removeItem(StorageEnum.User);
    },
  },
}));

export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserPermission = () => useUserStore((state) => state.userInfo.permissions);
export const useUserActions = () => useUserStore((state) => state.actions);

export function useSignIn() {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { setUserToken, setUserInfo, clearAllUserInfoAndToken } = useUserActions();
  const queryClient = useQueryClient();
  const signInMutation = useMutation({ mutationFn: authService.signin });

  const signIn = async (data: SignInReq) => {
    try {
      const token = await signInMutation.mutateAsync(data);
      if (!token.access_token || !token.token_type) {
        clearAllUserInfoAndToken();
        notification.error({
          message: 'Login failed',
          description: 'Invalid token response from the server.',
          duration: 3,
        });
        return;
      }

      setUserToken(token);

      const userData = await queryClient.fetchQuery({
        queryKey: ['my-user-data-signin'],
        queryFn: userService.getMyTenantData,
      });

      if (!userData?.permissions?.length) {
        clearAllUserInfoAndToken();
        notification.error({
          message: 'Login failed',
          description: 'Your account has no permissions assigned.',
          duration: 3,
        });
        return;
      }

      setUserInfo(userData);
      navigate(HOMEPAGE, { replace: true });
      notification.success({
        message: 'Signed in',
        description: `Welcome, ${userData.name}.`,
        duration: 3,
      });
    } catch (error) {
      const detail =
        error instanceof AxiosError
          ? error.response?.data?.detail
          : error instanceof Error
            ? error.message
            : 'Login failed.';
      notification.warning({
        message: 'Sign in failed',
        description: typeof detail === 'string' ? detail : 'Invalid credentials.',
        duration: 3,
      });
    }
  };

  return useCallback(signIn, [
    clearAllUserInfoAndToken,
    navigate,
    notification,
    queryClient,
    setUserInfo,
    setUserToken,
    signInMutation,
  ]);
}

export function useSignOut() {
  const navigate = useNavigate();
  const { clearAllUserInfoAndToken } = useUserActions();

  return useCallback(() => {
    clearAllUserInfoAndToken();
    navigate('/login', { replace: true });
  }, [clearAllUserInfoAndToken, navigate]);
}

export async function fetchCurrentUser(): Promise<MyUserTenantDataRes | null> {
  try {
    return await userService.getMyTenantData();
  } catch {
    return null;
  }
}

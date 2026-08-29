import apiClient from '../apiClient';

import { TokenRead } from '#/auth';

export enum AuthAPI {
  SignIn = '/v1/auth/login',
}

export interface SignInReq {
  username: string;
  password: string;
}

export type SignInRes = TokenRead;

const signin = (data: SignInReq) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return apiClient.post<SignInRes>({
    url: AuthAPI.SignIn,
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export default {
  signin,
};

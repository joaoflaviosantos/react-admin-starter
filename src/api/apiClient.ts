import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { mockAdapter } from '@/api/mock/adapter';
import { getItem } from '@/utils/storage';

import { Result } from '#/api';
import { TokenRead } from '#/auth';
import { StorageEnum } from '#/enum';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API ?? '',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
  adapter: useMock ? mockAdapter : undefined,
  paramsSerializer: {
    indexes: null,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getItem<TokenRead>(StorageEnum.Token);
    if (accessToken?.access_token) {
      config.headers.Authorization = `Bearer ${accessToken.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    if (res.data == null) {
      throw new Error('Empty response body.');
    }
    return res.data;
  },
  (error: AxiosError<Result>) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string' && detail.length > 0) {
      error.message = detail;
    }
    return Promise.reject(error);
  },
);

class APIClient {
  get<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET' });
  }

  post<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST' });
  }

  put<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT' });
  }

  patch<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PATCH' });
  }

  delete<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE' });
  }

  request<T>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request(config) as Promise<T>;
  }
}

export default new APIClient();

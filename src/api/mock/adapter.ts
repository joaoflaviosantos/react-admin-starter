import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError, AxiosHeaders } from 'axios';

import { handleMockRequest } from './handlers';

function settle(
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): Promise<AxiosResponse> {
  const response: AxiosResponse = {
    data,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
    headers: {},
    config,
    request: {},
  };

  if (status >= 200 && status < 300) {
    return Promise.resolve(response);
  }

  return Promise.reject(
    new AxiosError(
      typeof data === 'object' && data && 'detail' in data
        ? String((data as { detail: string }).detail)
        : `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_RESPONSE,
      config,
      {},
      response,
    ),
  );
}

export const mockAdapter: AxiosAdapter = (config) => {
  const normalized: InternalAxiosRequestConfig = {
    ...config,
    headers: AxiosHeaders.from(config.headers ?? {}),
  };
  const result = handleMockRequest(normalized);
  return settle(normalized, result.status, result.data);
};

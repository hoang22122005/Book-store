import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage, parseJwt } from '../utils';

export { parseJwt };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, { refreshToken });
          const accessToken = response.data?.data?.accessToken || response.data?.accessToken;
          const nextRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;
          if (accessToken) {
            tokenStorage.setTokens(accessToken, nextRefreshToken || refreshToken, tokenStorage.isPersistent());
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // Fall through to the common unauthenticated state below.
        }
      }

      tokenStorage.clearTokens();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

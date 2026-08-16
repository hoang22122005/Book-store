import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage, parseJwt } from '../utils';

export { parseJwt };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
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
    const backendMessage = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (backendMessage && typeof backendMessage === 'string') {
      error.message = backendMessage;
    }

    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Handle 401 - Token expired
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
      return Promise.reject(error);
    }

    // Convert technical errors to user-friendly messages
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'Yêu cầu quá chậm. Vui lòng kiểm tra kết nối mạng và thử lại.';
    } else if (error.response?.status === 413) {
      error.message = 'File quá lớn. Vui lòng chọn file nhỏ hơn.';
    } else if (error.response?.status === 500) {
      error.message = 'Lỗi hệ thống. Vui lòng thử lại sau.';
    } else if (error.response?.status === 503) {
      error.message = 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
    } else if (!error.response) {
      error.message = 'Không thể kết nối server. Vui lòng kiểm tra mạng.';
    }

    return Promise.reject(error);
  },
);

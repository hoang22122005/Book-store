import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse } from '../../../types/api/common';
import type { CartDetailRequest, CartDetailResponse } from '../../../types/api/cart';

export const cartService = {
  getCartDetails: () =>
    apiClient.get<ApiResponse<CartDetailResponse[]>>('/api/carts/cartDetails'),

  addCartDetail: (bookId: number) =>
    apiClient.post<ApiResponse<void>>('/api/carts/cartDetails', { bookId } satisfies CartDetailRequest),

  increaseQuantity: (bookId: number) =>
    apiClient.put<ApiResponse<void>>(`/api/carts/cartDetails/${bookId}/increase`),

  decreaseQuantity: (bookId: number) =>
    apiClient.put<ApiResponse<void>>(`/api/carts/cartDetails/${bookId}/decrease`),

  deleteCartDetail: (bookId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/carts/cartDetails/${bookId}`),
};

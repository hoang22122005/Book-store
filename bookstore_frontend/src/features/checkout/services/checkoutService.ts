import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse } from '../../../types/api/common';
import type { CheckoutResponse, CreateBillRequest } from '../../../types/api/bill';

export const checkoutService = {
  createBillFromCart: (request: CreateBillRequest) =>
    apiClient.post<ApiResponse<CheckoutResponse>>('/api/bills/checkout', request),
};

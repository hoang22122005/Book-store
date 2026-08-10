import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cartService';
import { useAuth } from '../../../hooks/useAuth';

export const CART_QUERY_KEY = ['cartDetails'];

export const useCartDetailsQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const response = await cartService.getCartDetails();
      if (!response.data.success) throw new Error(response.data.message || 'Không thể tải giỏ hàng');
      return response.data.data || [];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: number) => {
      const response = await cartService.addCartDetail(bookId);
      if (!response.data.success) throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useAddManyToCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, quantity }: { bookId: number; quantity: number }) => {
      for (let index = 0; index < quantity; index += 1) {
        const response = await cartService.addCartDetail(bookId);
        if (!response.data.success) throw new Error(response.data.message || 'Không thể thêm vào giỏ hàng');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useIncreaseCartQuantityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: number) => {
      const response = await cartService.increaseQuantity(bookId);
      if (!response.data.success) throw new Error(response.data.message || 'Không thể tăng số lượng');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useDecreaseCartQuantityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: number) => {
      const response = await cartService.decreaseQuantity(bookId);
      if (!response.data.success) throw new Error(response.data.message || 'Không thể giảm số lượng');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useDeleteCartDetailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: number) => {
      const response = await cartService.deleteCartDetail(bookId);
      if (!response.data.success) throw new Error(response.data.message || 'Không thể xóa sách khỏi giỏ hàng');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cartService';
import { useAuth } from '../../../hooks/useAuth';
import type { CartDetailResponse } from '../../../types/api/cart';

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
      return response.data;
    },
    onMutate: async (bookId: number) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartDetailResponse[]>(CART_QUERY_KEY);

      if (previousCart) {
        const existing = previousCart.find((item) => item.bookId === bookId);
        if (existing) {
          queryClient.setQueryData<CartDetailResponse[]>(
            CART_QUERY_KEY,
            previousCart.map((item) =>
              item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item
            )
          );
        }
      }

      return { previousCart };
    },
    onError: (_err, _bookId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
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
    onSettled: () => {
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
      return response.data;
    },
    onMutate: async (bookId: number) => {
      // 1. Dừng các query refetch đang chạy dở
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      // 2. Lưu lại bản snapshot dữ liệu cũ
      const previousCart = queryClient.getQueryData<CartDetailResponse[]>(CART_QUERY_KEY);

      // 3. Cập nhật lạc quan (Optimistic) ngay lập tức trên UI với 0ms trễ
      if (previousCart) {
        queryClient.setQueryData<CartDetailResponse[]>(
          CART_QUERY_KEY,
          previousCart.map((item) =>
            item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item
          )
        );
      }

      return { previousCart };
    },
    onError: (_err, _bookId, context) => {
      // Hoàn tác nếu server báo lỗi (ví dụ hết hàng)
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      // Đồng bộ ngầm với server
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
      return response.data;
    },
    onMutate: async (bookId: number) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartDetailResponse[]>(CART_QUERY_KEY);

      if (previousCart) {
        queryClient.setQueryData<CartDetailResponse[]>(
          CART_QUERY_KEY,
          previousCart.map((item) =>
            item.bookId === bookId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
          )
        );
      }

      return { previousCart };
    },
    onError: (_err, _bookId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
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
      return response.data;
    },
    onMutate: async (bookId: number) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartDetailResponse[]>(CART_QUERY_KEY);

      if (previousCart) {
        queryClient.setQueryData<CartDetailResponse[]>(
          CART_QUERY_KEY,
          previousCart.filter((item) => item.bookId !== bookId)
        );
      }

      return { previousCart };
    },
    onError: (_err, _bookId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

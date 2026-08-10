import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminBookService } from '../services/adminBookService';
import { adminBookQueryKeys } from './useAdminBookQueries';

const getApiData = <T>(response: { data: { success: boolean; message?: string; data?: T } }, fallbackMessage: string): T => {
  if (!response.data.success || response.data.data === undefined || response.data.data === null) {
    throw new Error(response.data.message || fallbackMessage);
  }
  return response.data.data;
};

export const useAdminAddBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await adminBookService.addBook(formData);
      return getApiData(response, 'Không thể tạo sách');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBookQueryKeys.all });
    },
  });
};

export const useAdminUpdateBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, formData }: { bookId: number; formData: FormData }) => {
      const response = await adminBookService.updateBook(bookId, formData);
      return getApiData(response, 'Không thể cập nhật sách');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminBookQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: adminBookQueryKeys.detail(variables.bookId) });
    },
  });
};

export const useAdminDeleteBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: number) => {
      const response = await adminBookService.deleteBook(bookId);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể xóa sách');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBookQueryKeys.all });
    },
  });
};

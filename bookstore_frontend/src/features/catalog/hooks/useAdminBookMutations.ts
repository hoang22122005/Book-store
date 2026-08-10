import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getApiData, type BookResponseDTO } from './bookQueryData';
import { catalogQueryKeys } from './useBooksQuery';

export const useAddBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponseDTO, Error, FormData>({
    mutationFn: async (formData: FormData) => getApiData(await bookService.addAdminBook(formData), 'Không thể tạo sách'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
    },
  });
};

export const useUpdateBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponseDTO, Error, { bookId: number; formData: FormData }>({
    mutationFn: async ({ bookId, formData }) => getApiData(await bookService.updateAdminBook(bookId, formData), 'Không thể cập nhật sách'),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(variables.bookId) });
    },
  });
};

export const useDeleteBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (bookId: number) => {
      const response = await bookService.deleteAdminBook(bookId);
      if (!response.data.success) throw new Error(response.data.message || 'Không thể xóa sách');
    },
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(bookId) });
    },
  });
};

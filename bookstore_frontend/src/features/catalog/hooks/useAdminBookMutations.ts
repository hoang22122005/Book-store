import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService, type BookResponseDTO } from '../services/bookService';
import { catalogQueryKeys } from './useBooksQuery';

export const useAddBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponseDTO, Error, FormData>({
    mutationFn: (formData: FormData) => bookService.addAdminBook(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
    },
  });
};

export const useUpdateBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<BookResponseDTO, Error, { bookId: number; formData: FormData }>({
    mutationFn: ({ bookId, formData }) => bookService.updateAdminBook(bookId, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(variables.bookId) });
    },
  });
};

export const useDeleteBookMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (bookId: number) => bookService.deleteAdminBook(bookId),
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(bookId) });
    },
  });
};

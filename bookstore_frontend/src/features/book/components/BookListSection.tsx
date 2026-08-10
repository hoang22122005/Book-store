import React from 'react';
import { BookGrid } from './BookGrid';
import { SectionPager } from '../../../components/common/SectionPager';
import { useSectionPagination } from '../../../hooks/useSectionPagination';
import type { Book, PageResponseDTO } from '../services/bookService';

interface BookListSectionProps {
  title: string;
  data: PageResponseDTO<Book> | undefined;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
  onAddToCart?: (id: number, e: React.MouseEvent) => void;
  columns?: 2 | 3 | 4;
  emptyMessage?: string;
  errorMessage?: string;
  onPageChange?: (page: number) => void;
  externalPage?: number;
}

export const BookListSection: React.FC<BookListSectionProps> = ({
  title,
  data,
  isLoading,
  isError,
  isFetching,
  refetch,
  onAddToCart,
  columns = 4,
  emptyMessage = 'Chưa có sách nào.',
  errorMessage = 'Không thể tải danh sách sách từ hệ thống.',
  onPageChange,
  externalPage,
}) => {
  const { page: internalPage, goToPage } = useSectionPagination();
  const page = externalPage ?? internalPage;
  const handlePageChange = onPageChange ?? goToPage;

  const books = data?.content || [];

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="flex justify-between items-end mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">
          {title}
        </h2>
        <SectionPager
          page={page}
          totalPages={data?.totalPages ?? 0}
          onPageChange={handlePageChange}
          disabled={isFetching}
        />
      </div>

      {isLoading && (
        <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-gutter ${isFetching ? 'opacity-60' : ''}`}>
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-lg p-4 animate-pulse space-y-4 shadow-sm"
            >
              <div className="aspect-[3/4] bg-surface-variant rounded"></div>
              <div className="h-4 bg-surface-variant rounded w-3/4"></div>
              <div className="h-3 bg-surface-variant rounded w-1/2"></div>
              <div className="h-6 bg-surface-variant rounded w-full"></div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-error text-white text-xs font-bold rounded-md hover:opacity-90 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !isError && books.length === 0 && (
        <div className="py-12 text-center text-on-surface-variant space-y-2 bg-surface-container-lowest rounded-lg border border-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">menu_book</span>
          <p className="font-medium text-sm">{emptyMessage}</p>
        </div>
      )}

      {!isLoading && !isError && books.length > 0 && (
        <BookGrid books={books} onAddToCart={onAddToCart} columns={columns} />
      )}
    </section>
  );
};

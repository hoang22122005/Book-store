import React from 'react';
import { BookCard } from './BookCard';
import { useBestsellerBooks } from '../hooks/useBestsellerBooks';
import { SectionPager } from '../../../components/common/SectionPager';
import { useSectionPagination } from '../../../hooks/useSectionPagination';

interface BestsellerBooksSectionProps {
  onAddToCart?: (id: string | number) => void;
}

export const BestsellerBooksSection: React.FC<BestsellerBooksSectionProps> = ({
  onAddToCart,
}) => {
  const { page, goToPage } = useSectionPagination();
  const { data, isLoading, isError, isFetching, refetch } = useBestsellerBooks(page, 4);

  const books = data?.content || [];

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg bg-surface-bright rounded-xl">
      <div className="flex justify-between items-end mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">
          Sách bán chạy
        </h2>
        <span className="hidden">
          Xem tất cả
        </span>
        <SectionPager page={page} totalPages={data?.totalPages ?? 0} onPageChange={goToPage} disabled={isFetching} />
      </div>

      {/* State 1: Loading */}
      {isLoading && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-gutter ${isFetching ? 'opacity-60' : ''}`}>
          {[1, 2, 3, 4].map((i) => (
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

      {/* State 2: Error */}
      {isError && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">Không thể tải danh sách sách bán chạy từ hệ thống.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-error text-white text-xs font-bold rounded-md hover:opacity-90 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* State 3: Empty */}
      {!isLoading && !isError && books.length === 0 && (
        <div className="py-12 text-center text-on-surface-variant space-y-2 bg-surface-container-lowest rounded-lg border border-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">menu_book</span>
          <p className="font-medium text-sm">Chưa có sách bán chạy nào được cập nhật.</p>
        </div>
      )}

      {/* State 4: Success */}
      {!isLoading && !isError && books.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              price={book.price}
              originalPrice={book.originalPrice}
              discountPercent={book.discountPercent}
              coverUrl={book.coverUrl}
              badgeText={book.badgeText}
              badgeType={book.badgeType}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};

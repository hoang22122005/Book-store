import React from 'react';
import { BookCard } from './BookCard';
import { useNewArrivalBooks } from '../hooks/useNewArrivalBooks';
import { SectionPager } from '../../../components/common/SectionPager';
import { useSectionPagination } from '../../../hooks/useSectionPagination';

interface NewArrivalsSectionProps {
  onAddToCart?: (id: string | number) => void;
  onSelectBook?: (id: string | number) => void;
}

export const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  onAddToCart,
  onSelectBook,
}) => {
  const { page, goToPage } = useSectionPagination();
  const { data, isLoading, isError, error, isFetching, refetch } = useNewArrivalBooks(page, 4);

  const books = data?.content || [];

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="flex justify-between items-end mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">
          Sách mới phát hành
        </h2>
        <span className="hidden">
          Xem tất cả
        </span>
        <SectionPager page={page} totalPages={data?.totalPages ?? 0} onPageChange={goToPage} disabled={isFetching} />
      </div>

      {/* Loading */}
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

      {/* Error */}
      {isError && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">
              {(error as Error)?.message || 'Không thể tải danh sách sách mới từ hệ thống.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-error text-white text-xs font-bold rounded-md hover:opacity-90 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && books.length === 0 && (
        <div className="py-12 text-center text-on-surface-variant space-y-2 bg-surface-container-lowest rounded-lg border border-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">menu_book</span>
          <p className="font-medium text-sm">Chưa có sách mới phát hành nào.</p>
        </div>
      )}

      {/* Success */}
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
              stockQuantity={book.quantityInStock}
              badgeText={book.badgeText || 'Mới'}
              badgeType="new"
              onAddToCart={onAddToCart}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      )}
    </section>
  );
};

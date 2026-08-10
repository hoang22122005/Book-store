import React from 'react';
import { Link } from 'react-router-dom';
import { useHotBooks } from '../hooks/useHotBooks';
import { SectionPager } from '../../../components/common/SectionPager';
import { useSectionPagination } from '../../../hooks/useSectionPagination';

interface HotBooksSectionProps {
  onSelectBook?: (id: string | number) => void;
}

export const HotBooksSection: React.FC<HotBooksSectionProps> = ({ onSelectBook }) => {
  const { page, goToPage } = useSectionPagination();
  const { data, isLoading, isError, error, isFetching, refetch } = useHotBooks(page, 3);

  const books = data?.content || [];

  const handleBookClick = (id: number, e: React.MouseEvent) => {
    if (onSelectBook) {
      e.preventDefault();
      onSelectBook(id);
    }
  };

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="flex items-center justify-between gap-stack-sm mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">
          Sách Hot tuần này
        </h2>
        <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">
          Trending
        </span>
        <SectionPager page={page} totalPages={data?.totalPages ?? 0} onPageChange={goToPage} disabled={isFetching} />
      </div>

      {/* State 1: Loading */}
      {isLoading && (
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-gutter ${isFetching ? 'opacity-60' : ''}`}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-stack-md p-stack-md bg-surface-container-lowest rounded-xl border border-outline-variant animate-pulse"
            >
              <div className="w-24 h-32 bg-surface-variant rounded flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-2">
                <div className="h-6 bg-surface-variant rounded w-12"></div>
                <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                <div className="h-3 bg-surface-variant rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* State 2: Error */}
      {isError && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">
              {(error as Error)?.message || 'Không thể tải danh sách sách hot từ hệ thống.'}
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

      {/* State 3: Empty */}
      {!isLoading && !isError && books.length === 0 && (
        <div className="py-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-lg border border-surface-variant">
          <p className="font-medium text-sm">Chưa có dữ liệu sách hot trong tuần này.</p>
        </div>
      )}

      {/* State 4: Success */}
      {!isLoading && !isError && books.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {books.map((book, idx) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              onClick={(e) => handleBookClick(book.id, e)}
              className="flex gap-stack-md p-stack-md bg-surface-container-lowest rounded-xl border border-outline-variant hover:border-secondary transition-colors cursor-pointer group"
            >
              <div className="w-24 h-32 bg-surface-variant rounded flex-shrink-0 overflow-hidden relative">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      book.quantityInStock <= 0 ? 'grayscale-[40%] opacity-75' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline">book</span>
                  </div>
                )}
                {book.quantityInStock <= 0 && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="px-1.5 py-0.5 bg-error text-white font-bold text-[10px] uppercase tracking-wider rounded border border-white/20">
                      Hết hàng
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-secondary font-bold text-headline-md mb-unit">
                  #{idx + 1}
                </span>
                <h3 className="font-label-md text-on-surface font-semibold group-hover:text-secondary transition-colors line-clamp-1">
                  {book.title}
                </h3>
                <p className="font-caption text-on-surface-variant line-clamp-1">{book.author}</p>
                <div className="mt-stack-sm flex items-center gap-unit text-error">
                  <span className="material-symbols-outlined text-[16px]">
                    local_fire_department
                  </span>
                  <span className="text-caption font-bold">
                    {book.buyCount > 0 ? `${book.buyCount} lượt mua` : 'Sách nổi bật'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

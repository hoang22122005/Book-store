import React from 'react';
import { Link } from 'react-router-dom';
import { SectionPager } from '../../../components/common/SectionPager';
import { useSectionPagination } from '../../../hooks/useSectionPagination';
import { formatCurrency } from '../../../utils';
import { useUserRecommendations } from '../hooks/useUserRecommendations';

interface PersonalizedSectionProps {
  onSelectBook?: (id: string | number) => void;
}

export const PersonalizedSection: React.FC<PersonalizedSectionProps> = ({ onSelectBook }) => {
  const { page, goToPage } = useSectionPagination();
  const { data, isLoading, isError, isFetching } = useUserRecommendations(page, 4);

  const books = data?.content || [];

  const handleBookClick = (id: number, e: React.MouseEvent) => {
    if (onSelectBook) {
      e.preventDefault();
      onSelectBook(id);
    }
  };

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg bg-surface-container-low rounded-xl my-stack-lg">
      <div className="flex justify-between items-end mb-stack-md">
        <h2 className="font-headline-md text-headline-md text-primary font-bold">
          Dành riêng cho bạn
        </h2>
        <Link to="/books?filter=personalized" className="hidden">
          Xem thêm
        </Link>
        <SectionPager page={page} totalPages={data?.totalPages ?? 0} onPageChange={goToPage} disabled={isFetching} />
      </div>

      {isLoading && (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-gutter ${isFetching ? 'opacity-60' : ''}`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-lg p-4 animate-pulse space-y-3">
              <div className="aspect-[3/4] bg-surface-variant rounded"></div>
              <div className="h-4 bg-surface-variant rounded w-3/4"></div>
              <div className="h-3 bg-surface-variant rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="py-6 text-center text-on-surface-variant text-sm">
          Đăng nhập để xem danh sách gợi ý cá nhân hóa dành riêng cho bạn.
        </div>
      )}

      {!isLoading && !isError && books.length === 0 && (
        <div className="py-8 text-center text-on-surface-variant text-sm bg-surface-container-lowest rounded-lg">
          Chưa có dữ liệu gợi ý cho tài khoản của bạn. Đăng nhập hoặc xem thêm sách để nhận đề xuất!
        </div>
      )}

      {!isLoading && !isError && books.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              onClick={(e) => handleBookClick(book.id, e)}
              className="bg-surface-container-lowest rounded-lg p-stack-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-[3/4] bg-surface-variant rounded mb-stack-sm flex items-center justify-center overflow-hidden relative">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className={`w-full h-full object-cover p-2 ${
                      book.quantityInStock <= 0 ? 'grayscale-[40%] opacity-75' : ''
                    }`}
                  />
                ) : (
                  <span className="material-symbols-outlined text-outline text-[48px]">book</span>
                )}
                {book.quantityInStock <= 0 && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="px-2 py-0.5 bg-error text-white font-bold text-[10px] uppercase tracking-wider rounded border border-white/20">
                      Hết hàng
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-label-md text-on-surface line-clamp-1 font-semibold">
                  {book.title}
                </h3>
                <p className="font-caption text-on-surface-variant">{book.author}</p>
              </div>
              <div className="mt-stack-sm flex justify-between items-center">
                <span className="text-primary font-bold text-sm">
                  {formatCurrency(book.price)}
                </span>
                <span className="text-caption text-secondary font-medium">Gợi ý cho bạn</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

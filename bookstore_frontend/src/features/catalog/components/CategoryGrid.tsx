import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';

const getCategoryIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('kỹ năng') || n.includes('tâm lý')) return 'psychology';
  if (n.includes('văn học') || n.includes('tiểu thuyết')) return 'auto_stories';
  if (n.includes('kinh tế') || n.includes('tài chính') || n.includes('quản trị')) return 'trending_up';
  if (n.includes('công nghệ') || n.includes('lập trình') || n.includes('máy tính')) return 'devices';
  if (n.includes('thiếu nhi') || n.includes('trẻ em')) return 'child_care';
  if (n.includes('lịch sử') || n.includes('triết học')) return 'history_edu';
  if (n.includes('ngoại ngữ') || n.includes('tiếng anh')) return 'translate';
  return 'category';
};

export const CategoryGrid: React.FC = () => {
  const { data: genres = [], isLoading, isError, refetch } = useCategories();

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <h2 className="font-headline-md text-headline-md text-primary mb-stack-md text-center font-bold">
        Danh mục nổi bật
      </h2>

      {/* State 1: Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-stack-md">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-stack-md bg-surface-container-lowest rounded-lg animate-pulse space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-surface-variant"></div>
              <div className="h-4 bg-surface-variant rounded w-20"></div>
            </div>
          ))}
        </div>
      )}

      {/* State 2: Error */}
      {isError && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">Không thể tải danh sách danh mục sách từ hệ thống.</p>
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
      {!isLoading && !isError && genres.length === 0 && (
        <div className="py-8 text-center text-on-surface-variant bg-surface-container-lowest rounded-lg border border-surface-variant">
          <p className="font-medium text-sm">Chưa có danh mục sách nào trong hệ thống.</p>
        </div>
      )}

      {/* State 4: Success */}
      {!isLoading && !isError && genres.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-stack-md">
          {genres.slice(0, 10).map((cat) => (
            <Link
              key={cat.genreId}
              to={`/books?categoryId=${cat.genreId}`}
              className="flex flex-col items-center justify-center p-stack-md bg-surface-container-lowest rounded-lg shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-stack-sm group-hover:bg-primary transition-colors">
                <span className="material-symbols-outlined text-primary group-hover:text-on-primary text-[32px]">
                  {getCategoryIcon(cat.name)}
                </span>
              </div>
              <span className="font-label-md text-label-md text-on-surface font-semibold text-center line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

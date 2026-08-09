import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, SlidersHorizontal, X } from 'lucide-react';
import { useBookCatalog } from '../../features/book/hooks';
import { BookCard, BookGrid } from '../../features/book/components';
import { PRICE_RANGES, SORT_OPTIONS, AUTHORS } from '../../features/book/constants/bookFilters';

export const BookCatalogPage: React.FC = () => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const {
    books,
    genres,
    totalPages,
    totalElements,
    isLoading,
    isError,
    isFetching,
    refetch,
    filters,
    toggleCategory,
    toggleAuthor,
    togglePriceRange,
    toggleInStock,
    changeSort,
    goToPage,
    clearFilters,
    hasActiveFilters,
  } = useBookCatalog();

  return (
    <div className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-2">
          Danh sách sách
        </h1>
        <p className="text-on-surface-variant">Khám phá hàng ngàn tựa sách hấp dẫn</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium cursor-pointer"
          >
            <SlidersHorizontal size={18} />
            Bộ lọc
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center">
                {filters.categories.length + filters.authors.length + (filters.priceRange ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
            <div className="absolute right-0 top-0 h-full w-80 bg-surface p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-sm text-headline-sm font-bold">Bộ lọc</h3>
                <button onClick={() => setShowMobileFilters(false)} className="cursor-pointer">
                  <X size={24} />
                </button>
              </div>
              <FilterSidebar
                genres={genres}
                filters={filters}
                hasActiveFilters={hasActiveFilters}
                toggleCategory={toggleCategory}
                toggleAuthor={toggleAuthor}
                togglePriceRange={togglePriceRange}
                toggleInStock={toggleInStock}
                clearFilters={clearFilters}
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar
            genres={genres}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            toggleCategory={toggleCategory}
            toggleAuthor={toggleAuthor}
            togglePriceRange={togglePriceRange}
            toggleInStock={toggleInStock}
            clearFilters={clearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Sort & Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-on-surface-variant text-sm">
              {isFetching ? 'Đang tải...' : `${totalElements} sản phẩm`}
            </p>
            <select
              value={filters.sort}
              onChange={(e) => changeSort(e.target.value)}
              className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {isLoading && <LoadingGrid />}

          {/* Error State */}
          {isError && (
            <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-sm font-medium">Không thể tải danh sách sách.</p>
              </div>
              <button onClick={() => refetch()} className="px-3 py-1 bg-error text-white text-xs font-bold rounded-md hover:opacity-90 cursor-pointer">
                Thử lại
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && books.length === 0 && (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4">search_off</span>
              <p className="font-medium text-on-surface-variant mb-2">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm text-on-surface-variant mb-4">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button onClick={clearFilters} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 cursor-pointer">
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Book Grid */}
          {!isLoading && !isError && books.length > 0 && (
            <>
              <BookGrid books={books} columns={4} />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination page={filters.page} totalPages={totalPages} onPageChange={goToPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterSidebarProps {
  genres: { genreId: number; name: string }[];
  filters: {
    categories: number[];
    authors: string[];
    priceRange: { min?: number; max?: number } | null;
    inStockOnly: boolean;
  };
  hasActiveFilters: boolean;
  toggleCategory: (id: number) => void;
  toggleAuthor: (author: string) => void;
  togglePriceRange: (range: { min?: number; max?: number } | null) => void;
  toggleInStock: (checked: boolean) => void;
  clearFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  genres,
  filters,
  hasActiveFilters,
  toggleCategory,
  toggleAuthor,
  togglePriceRange,
  toggleInStock,
  clearFilters,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
        <SlidersHorizontal size={20} />
        Bộ lọc tìm kiếm
      </h3>
      {hasActiveFilters && (
        <button onClick={clearFilters} className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer">
          Xóa tất cả
        </button>
      )}
    </div>

    <FilterSection title="Danh mục">
      {genres.map((genre) => (
        <CheckboxItem
          key={genre.genreId}
          label={genre.name}
          checked={filters.categories.includes(genre.genreId)}
          onChange={() => toggleCategory(genre.genreId)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Tác giả">
      {AUTHORS.map((author) => (
        <CheckboxItem
          key={author}
          label={author}
          checked={filters.authors.includes(author)}
          onChange={() => toggleAuthor(author)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Giá">
      {PRICE_RANGES.map((range) => (
        <RadioItem
          key={range.label}
          label={range.label}
          checked={filters.priceRange?.min === range.min && filters.priceRange?.max === range.max}
          onChange={() => togglePriceRange(range)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Tình trạng">
      <CheckboxItem
        label="Còn hàng"
        checked={filters.inStockOnly}
        onChange={(e) => toggleInStock(e.target.checked)}
      />
    </FilterSection>
  </div>
);

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-surface-container-lowest rounded-lg p-4 border border-outline-variant">
    <h4 className="font-label-lg font-semibold text-on-surface mb-3">{title}</h4>
    <div className="space-y-2 max-h-48 overflow-y-auto">{children}</div>
  </div>
);

const CheckboxItem: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" />
    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
  </label>
);

const RadioItem: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input type="radio" name="priceRange" checked={checked} onChange={onChange} className="w-4 h-4 border-outline-variant text-primary focus:ring-primary cursor-pointer" />
    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
  </label>
);

const LoadingGrid: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-surface-container-lowest rounded-lg p-4 animate-pulse space-y-3">
        <div className="aspect-[3/4] bg-surface-variant rounded"></div>
        <div className="h-4 bg-surface-variant rounded w-3/4"></div>
        <div className="h-3 bg-surface-variant rounded w-1/2"></div>
        <div className="h-6 bg-surface-variant rounded w-full"></div>
      </div>
    ))}
  </div>
);

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
    if (page < 3) return [0, 1, 2, 3, 4];
    if (page > totalPages - 4) return Array.from({ length: 5 }, (_, i) => totalPages - 5 + i);
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer ${
            page === pageNum ? 'bg-primary text-white' : 'border border-outline-variant hover:bg-surface-container-low text-on-surface'
          }`}
        >
          {pageNum + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page === totalPages - 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

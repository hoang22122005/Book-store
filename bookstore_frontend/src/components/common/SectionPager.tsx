import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SectionPagerProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const SectionPager: React.FC<SectionPagerProps> = ({ page, totalPages, onPageChange, disabled = false }) => {
  if (totalPages <= 1) return null;

  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  return (
    <div className="flex items-center gap-1 text-secondary">
      <button type="button" aria-label="Xem nhóm sách trước" onClick={() => onPageChange(page - 1)} disabled={disabled || !canGoPrevious} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary-container/20 disabled:cursor-not-allowed disabled:opacity-30">
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={disabled || !canGoNext} className="rounded-md px-2 py-1 font-label-md text-label-md hover:underline disabled:cursor-not-allowed disabled:opacity-50">
        Xem thêm
      </button>
      <button type="button" aria-label="Xem nhóm sách tiếp theo" onClick={() => onPageChange(page + 1)} disabled={disabled || !canGoNext} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary-container/20 disabled:cursor-not-allowed disabled:opacity-30">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

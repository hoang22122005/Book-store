import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../utils';

export interface BookCardProps {
  id: string | number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badgeText?: string;
  badgeType?: 'discount' | 'new';
  coverUrl?: string;
  isOutOfStock?: boolean;
  stockQuantity?: number;
  onAddToCart?: (id: string | number, e: React.MouseEvent) => void;
  onSelectBook?: (id: string | number) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  author,
  price,
  originalPrice,
  discountPercent,
  badgeText,
  badgeType = 'discount',
  coverUrl,
  isOutOfStock,
  stockQuantity,
  onAddToCart,
  onSelectBook,
}) => {
  const navigate = useNavigate();
  const isOut = isOutOfStock || (stockQuantity !== undefined && stockQuantity <= 0);
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | undefined>();
  const imageFailed = Boolean(coverUrl && failedCoverUrl === coverUrl);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOut) return;
    if (onAddToCart) {
      onAddToCart(id, e);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelectBook) {
      onSelectBook(id);
      return;
    }
    navigate(`/books/${id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="bg-surface-container-lowest rounded-lg shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow relative"
    >
      <div className="flex-1 flex flex-col justify-between">
        {/* Badge */}
        {(discountPercent || badgeText) && !isOut && (
          <div
            className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-full font-caption text-caption font-bold ${
              badgeType === 'new'
                ? 'bg-primary text-white font-medium'
                : 'bg-secondary-container text-on-secondary-container'
            }`}
          >
            {badgeText || `-${discountPercent}%`}
          </div>
        )}

        {/* Book Cover Container */}
        <div className="relative pt-[140%] bg-surface border-b border-surface-variant overflow-hidden">
          {coverUrl && !imageFailed ? (
            <img
              src={coverUrl}
              alt={title}
              className={`absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ${
                isOut ? 'grayscale-[40%] opacity-75' : ''
              }`}
              loading="lazy"
              onError={() => setFailedCoverUrl(coverUrl)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl" aria-hidden="true">menu_book</span>
              <span className="text-caption">Chưa có ảnh bìa</span>
            </div>
          )}

          {/* Out of Stock Overlay Badge */}
          {isOut && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-20 flex items-center justify-center">
              <span className="px-3 py-1 bg-error text-white font-bold text-caption uppercase tracking-wider rounded-md shadow-md border border-white/20 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">block</span>
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-stack-sm md:p-stack-md flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-label-md text-label-md text-on-surface line-clamp-2 mb-unit group-hover:text-secondary transition-colors">
              {title}
            </h3>
            <p className="font-caption text-caption text-on-surface-variant mb-stack-sm">
              {author}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-stack-sm">
            <div>
              <span className="font-label-md text-label-md text-primary font-bold block">
                {formatCurrency(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="font-caption text-caption text-outline line-through block">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOut}
              aria-label={isOut ? 'Sách đã hết hàng' : 'Thêm vào giỏ hàng'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isOut
                  ? 'bg-surface-variant text-outline opacity-50 cursor-not-allowed'
                  : 'bg-primary-fixed text-primary hover:bg-primary hover:text-white'
              }`}
              title={isOut ? 'Sách đã hết hàng' : 'Thêm vào giỏ hàng'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isOut ? 'remove_shopping_cart' : 'add_shopping_cart'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

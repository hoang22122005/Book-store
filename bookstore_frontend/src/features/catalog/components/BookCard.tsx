import React from 'react';
import { Link } from 'react-router-dom';
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
  coverUrl: string;
  onAddToCart?: (id: string | number, e: React.MouseEvent) => void;
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
  onAddToCart,
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id, e);
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-lg shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow relative">
      <Link to={`/books/${id}`} className="flex-1 flex flex-col justify-between">
        {/* Badge */}
        {(discountPercent || badgeText) && (
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
          <img
            src={coverUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
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
              aria-label="Thêm vào giỏ hàng"
              className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer"
              title="Thêm vào giỏ hàng"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import type { Book } from '../services/bookService';

export interface BookCardProps {
  book: Book;
  onAddToCart?: (id: number, e: React.MouseEvent) => void;
  showActions?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onAddToCart,
  showActions = true,
}) => {
  const hasDiscount = book.discountPercent && book.discountPercent > 0;
  const isOutOfStock = book.quantityInStock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(book.id, e);
    }
  };

  return (
    <article className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
      <Link to={`/books/${book.id}`} className="block relative">
        <div className="aspect-[3/4] bg-surface overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover p-3 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-[48px]">book</span>
            </div>
          )}
        </div>
        {hasDiscount && (
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
            -{book.discountPercent}%
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full bg-error text-white text-xs font-bold">
            Hết hàng
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link to={`/books/${book.id}`}>
          <h3 className="font-label-md text-on-surface line-clamp-2 mb-1 group-hover:text-secondary transition-colors font-medium">
            {book.title}
          </h3>
        </Link>
        <p className="text-caption text-on-surface-variant line-clamp-1 mb-2">{book.author}</p>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-label-md text-primary font-bold">{formatCurrency(book.price)}</span>
          {hasDiscount && book.originalPrice && (
            <span className="text-caption text-on-surface-variant line-through">
              {formatCurrency(book.originalPrice)}
            </span>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 h-10 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 h-full flex items-center justify-center gap-1 px-3 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingCart size={16} />
              <span className="truncate">{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
            </button>
            <Link
              to={`/books/${book.id}`}
              className="w-10 h-full flex items-center justify-center border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
            >
              <Eye size={16} className="text-on-surface-variant" />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};

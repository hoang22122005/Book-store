import React, { useState, useEffect } from 'react';
import { useBookDetail } from '../hooks/useBookDetail';
import { useSimilarBooks } from '../hooks/useSimilarBooks';
import { useBookComments, useBookRatings } from '../hooks/useCustomerReviews';
import { formatCurrency } from '../../../utils';

interface BookDetailModalProps {
  bookId: number | null;
  onClose: () => void;
  onAddToCart?: (bookId: number, quantity: number) => void;
  onBuyNow?: (bookId: number, quantity: number) => void;
  onSelectBook?: (bookId: number) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  bookId,
  onClose,
  onAddToCart,
  onBuyNow,
  onSelectBook,
}) => {
  const { data: book, isLoading, isError, refetch } = useBookDetail(bookId || 0);
  const { data: similarBooks, isLoading: isLoadingSimilar } = useSimilarBooks(bookId || 0);
  const { data: comments } = useBookComments(bookId || 0);
  const { data: ratings } = useBookRatings(bookId || 0);
  const [quantityByBookId, setQuantityByBookId] = useState<Record<number, number>>({});
  const [expandedBookIds, setExpandedBookIds] = useState<Set<number>>(() => new Set());
  const [failedImageBookIds, setFailedImageBookIds] = useState<Set<number>>(() => new Set());
  const stateBookId = bookId ?? 0;
  const quantity = quantityByBookId[stateBookId] ?? 1;
  const isExpandedDescription = expandedBookIds.has(stateBookId);
  const imageFailed = failedImageBookIds.has(stateBookId);

  const setQuantity = (updater: (current: number) => number) => {
    setQuantityByBookId((current) => ({
      ...current,
      [stateBookId]: updater(current[stateBookId] ?? 1),
    }));
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!bookId) return null;

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncreaseQty = () => {
    if (book && quantity < book.quantityInStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCartClick = () => {
    if (book && onAddToCart) {
      onAddToCart(book.id, quantity);
    }
  };

  const handleBuyNowClick = () => {
    if (book && onBuyNow) {
      onBuyNow(book.id, quantity);
    }
  };

  const ratingByUser = new Map((ratings?.content || []).map((rating) => [rating.userId, rating.ratingValue]));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="bg-surface-container-lowest border border-surface-variant rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-surface-container/80 text-on-surface-variant hover:bg-error-container hover:text-error flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng (ESC)"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="p-8 md:p-12 space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-[3/4] bg-surface-variant rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-surface-variant rounded w-3/4"></div>
                <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                <div className="h-10 bg-surface-variant rounded w-full"></div>
                <div className="h-24 bg-surface-variant rounded w-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-8 text-center space-y-4">
            <span className="material-symbols-outlined text-error text-5xl">menu_book</span>
            <h3 className="font-bold text-headline-sm text-on-surface">
              Không thể tải thông tin cuốn sách này
            </h3>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
              Vui lòng thử lại sau hoặc đóng cửa sổ này.
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-colors cursor-pointer text-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Success State - Book Details Overlay Content */}
        {!isLoading && !isError && book && (
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Left: Cover Image Column (5 cols) */}
            <div className="w-full min-w-0 md:col-span-5">
              <div className="relative w-full aspect-[3/4] max-w-[280px] md:max-w-none mx-auto bg-surface-variant rounded-xl border border-surface-variant overflow-hidden shadow-md group">
                {book.coverUrl && !imageFailed ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className={`absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ${
                      book.quantityInStock <= 0 ? 'grayscale-[40%] opacity-75' : ''
                    }`}
                    onError={() => setFailedImageBookIds((current) => new Set(current).add(stateBookId))}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-7xl" aria-hidden="true">menu_book</span>
                    <span className="text-body-md font-medium">Chưa có ảnh bìa</span>
                  </div>
                )}

                {/* VIP / Discount Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {book.isVip && (
                    <span className="bg-amber-500 text-white font-bold text-caption px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      Sách VIP
                    </span>
                  )}
                  {book.discountPercent !== undefined && (
                    <span className="bg-error text-white font-bold text-caption px-2 py-0.5 rounded-full shadow-sm">
                      -{Number.isInteger(book.discountPercent) ? book.discountPercent : book.discountPercent.toFixed(1)}%
                    </span>
                  )}
                </div>

                {/* Centered Out of Stock Overlay */}
                {book.quantityInStock <= 0 && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <span className="px-3.5 py-1.5 bg-error text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg border border-white/20 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">block</span>
                      Hết hàng
                    </span>
                  </div>
                )}

                {/* Stock Tag Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-xs text-white text-caption px-3 py-1.5 rounded-lg flex items-center justify-between z-30">
                  <span>Trạng thái kho:</span>
                  <span className={`font-bold ${book.quantityInStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {book.quantityInStock > 0 ? `Còn ${book.quantityInStock} cuốn` : 'Hết hàng'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Info & Specs Column (7 cols) */}
            <div className="md:col-span-7 space-y-5">
              {/* Title & Author */}
              <div>
                {book.genres && book.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {book.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-fixed text-primary font-semibold text-caption px-2.5 py-0.5 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md font-bold text-primary leading-tight">
                  {book.title}
                </h2>

                <p className="text-body-md text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>Tác giả: <strong className="text-on-surface">{book.author}</strong></span>
                </p>
              </div>

              {/* Ratings & Buy Count Bar */}
              <div className="flex flex-wrap items-center gap-4 py-2 border-y border-surface-variant text-body-md">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-amber-500 fill-1 text-[20px]">
                    star
                  </span>
                  <span className="font-bold text-on-surface">{book.avgRating.toFixed(1)}</span>
                  <span className="text-caption text-on-surface-variant">
                    ({book.cntRating} đánh giá)
                  </span>
                </div>
                <div className="w-px h-4 bg-surface-variant"></div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    shopping_bag
                  </span>
                  <span>Đã bán: <strong className="text-on-surface">{book.buyCount}</strong></span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-surface-container-low p-4 rounded-xl flex items-baseline gap-3">
                <span className="font-headline-md text-headline-md font-bold text-primary">
                  {formatCurrency(book.price)}
                </span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-body-md text-outline line-through">
                    {formatCurrency(book.originalPrice)}
                  </span>
                )}
              </div>

              {/* Key Specs Grid (Mục thông số cơ bản có ý nghĩa cho người dùng) */}
              <div>
                <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mb-2">
                  Thông tin xuất bản & Thông số
                </h3>
                <div className="grid grid-cols-2 gap-2 text-caption bg-surface border border-surface-variant rounded-xl p-3.5">
                  <div className="space-y-1">
                    <span className="text-on-surface-variant block">Nhà xuất bản:</span>
                    <strong className="text-on-surface block truncate">{book.publisher || 'Đang cập nhật'}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-on-surface-variant block">Năm xuất bản:</span>
                    <strong className="text-on-surface block">{book.publishYear || 'N/A'}</strong>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-surface-variant">
                    <span className="text-on-surface-variant block">Số trang:</span>
                    <strong className="text-on-surface block">{book.pageCount ? `${book.pageCount} trang` : 'N/A'}</strong>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-surface-variant">
                    <span className="text-on-surface-variant block">Mã ISBN:</span>
                    <strong className="text-on-surface block font-mono text-[11px] truncate">{book.isbn || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {book.description && (
                <div>
                  <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider mb-1.5">
                    Mô tả sách
                  </h3>
                  <div
                    className={`text-body-md text-on-surface-variant leading-relaxed ${
                      !isExpandedDescription && book.description.length > 180 ? 'line-clamp-3' : ''
                    }`}
                  >
                    {book.description}
                  </div>
                  {book.description.length > 180 && (
                    <button
                      onClick={() => setExpandedBookIds((current) => {
                        const next = new Set(current);
                        if (next.has(stateBookId)) next.delete(stateBookId);
                        else next.add(stateBookId);
                        return next;
                      })}
                      className="text-caption font-bold text-secondary hover:underline mt-1 inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isExpandedDescription ? 'Thu gọn' : 'Xem thêm mô tả'}</span>
                      <span className="material-symbols-outlined text-sm">
                        {isExpandedDescription ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Actions & Quantity Selector */}
              <div className="pt-3 border-t border-surface-variant space-y-3">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-body-md text-on-surface">Số lượng:</span>
                  <div className="flex items-center border border-surface-variant rounded-lg overflow-hidden bg-surface">
                    <button
                      onClick={handleDecreaseQty}
                      disabled={quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center hover:bg-surface-variant disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-10 text-center font-bold text-sm select-none">{quantity}</span>
                    <button
                      onClick={handleIncreaseQty}
                      disabled={quantity >= book.quantityInStock}
                      className="w-9 h-9 flex items-center justify-center hover:bg-surface-variant disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCartClick}
                    disabled={book.quantityInStock <= 0}
                    className="py-3 px-4 bg-primary-fixed text-primary font-bold rounded-xl hover:bg-primary hover:text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer text-body-md"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                    <span>Thêm vào giỏ hàng</span>
                  </button>

                  <button
                    onClick={handleBuyNowClick}
                    disabled={book.quantityInStock <= 0}
                    className="py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-secondary disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer text-body-md"
                  >
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    <span>Mua ngay</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-12 space-y-7 border-t border-surface-variant pt-6">
              <section aria-labelledby="book-comments-heading">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 id="book-comments-heading" className="font-bold text-title-lg text-on-surface">Đánh giá & bình luận</h3>
                    <p className="text-sm text-on-surface-variant">Chia sẻ từ độc giả đã đọc sách.</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="material-symbols-outlined fill-1">star</span>
                    <strong className="text-on-surface">{book.avgRating.toFixed(1)}</strong>
                    <span className="text-sm text-on-surface-variant">/ 5</span>
                  </div>
                </div>

                {comments?.content?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {comments.content.map((comment) => {
                      const rating = ratingByUser.get(comment.userId);
                      return (
                        <article key={comment.commentId} className="rounded-xl border border-surface-variant bg-surface-container-low p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-8 h-8 shrink-0 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center">
                                {(comment.userName || 'Đ').charAt(0).toUpperCase()}
                              </span>
                              <strong className="text-sm text-on-surface truncate">{comment.userName || 'Độc giả'}</strong>
                            </div>
                            {rating && (
                              <div className="flex text-amber-500" aria-label={`${rating} trên 5 sao`}>
                                {Array.from({ length: rating }).map((_, index) => <span key={index} className="material-symbols-outlined text-[17px] fill-1">star</span>)}
                              </div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-on-surface-variant">{comment.content}</p>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Chưa có bình luận cho cuốn sách này.</p>
                )}
              </section>

              <section aria-labelledby="similar-books-heading">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 id="similar-books-heading" className="font-bold text-title-lg text-on-surface">Sách tương tự</h3>
                    <p className="text-sm text-on-surface-variant">Có thể bạn cũng sẽ thích những tựa sách này.</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary" aria-hidden="true">auto_awesome</span>
                </div>

                {isLoadingSimilar ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-52 rounded-xl bg-surface-variant animate-pulse" />)}</div>
                ) : similarBooks?.content?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {similarBooks.content.map((similar) => (
                      <article key={similar.id} className="rounded-xl border border-surface-variant bg-surface overflow-hidden flex flex-col">
                        <button onClick={() => onSelectBook?.(similar.id)} className="relative aspect-[3/4] bg-surface-container-low overflow-hidden cursor-pointer" title={`Xem ${similar.title}`}>
                          {similar.coverUrl ? <img src={similar.coverUrl} alt={similar.title} className="w-full h-full object-contain p-3" /> : <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-5xl text-on-surface-variant">menu_book</span>}
                        </button>
                        <div className="p-3 flex flex-col gap-2 flex-1">
                          <button onClick={() => onSelectBook?.(similar.id)} className="text-left font-bold text-sm text-on-surface line-clamp-2 hover:text-primary cursor-pointer">{similar.title}</button>
                          <div className="flex items-center gap-1 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-[16px] text-amber-500 fill-1">star</span>{similar.avgRating.toFixed(1)} <span>({similar.cntRating})</span></div>
                          <div className="mt-auto flex items-center justify-between gap-2"><strong className="text-sm text-primary">{formatCurrency(similar.price)}</strong><button onClick={() => onAddToCart?.(similar.id, 1)} disabled={similar.quantityInStock <= 0} className="w-8 h-8 rounded-full bg-primary text-white disabled:opacity-40 flex items-center justify-center cursor-pointer" title="Thêm vào giỏ hàng"><span className="material-symbols-outlined text-[17px]">add_shopping_cart</span></button></div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : <p className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Chưa tìm thấy sách tương tự.</p>}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailModal;

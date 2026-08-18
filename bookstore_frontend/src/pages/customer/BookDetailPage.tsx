import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingCart, Zap, Star } from 'lucide-react';
import { useBookDetail, useBookComments } from '../../features/book/hooks';
import { formatCurrency } from '../../utils';

export const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { data: book, isLoading, isError, refetch } = useBookDetail(Number(bookId));
  const { data: reviewsData, isLoading: reviewsLoading } = useBookComments(Number(bookId), 0, 5);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(book?.quantityInStock || 10, prev + 1));
  };

  const handleAddToCart = () => {
    console.log('Add to cart:', { bookId: book?.id, quantity });
  };

  const handleBuyNow = () => {
    console.log('Buy now:', { bookId: book?.id, quantity });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-surface-variant rounded w-48"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 aspect-[3/4] bg-surface-variant rounded-lg"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-surface-variant rounded w-3/4"></div>
              <div className="h-4 bg-surface-variant rounded w-1/2"></div>
              <div className="h-6 bg-surface-variant rounded w-1/3"></div>
              <div className="h-10 bg-surface-variant rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
        <div className="bg-error-container text-on-error-container p-6 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-medium">Không thể tải thông tin sách. Vui lòng thử lại.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-error text-white text-sm font-bold rounded-md hover:opacity-90 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const hasDiscount = book.discountPercent && book.discountPercent > 0;
  const reviews = reviewsData?.content || [];

  return (
    <div className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
        <Link to="/" className="hover:text-secondary transition-colors">Trang chủ</Link>
        <ChevronRight size={16} />
        <Link to="/books" className="hover:text-secondary transition-colors">Sách</Link>
        {book.genres && book.genres.length > 0 && (
          <>
            <ChevronRight size={16} />
            <Link
              to={`/books?category=${book.genres[0]}`}
              className="hover:text-secondary transition-colors"
            >
              {book.genres[0]}
            </Link>
          </>
        )}
        <ChevronRight size={16} />
        <span className="text-on-surface font-semibold line-clamp-1">{book.title}</span>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Image */}
        <div className="w-full md:w-1/3">
          <div className="relative aspect-[3/4] bg-surface rounded-lg overflow-hidden border border-surface-variant">
            {hasDiscount && (
              <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-bold">
                -{book.discountPercent}%
              </div>
            )}
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-[64px]">book</span>
              </div>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1">
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-2">
            {book.title}
          </h1>
          
          <p className="text-on-surface-variant mb-4">
            Tác giả: <span className="text-secondary font-medium">{book.author}</span>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-secondary">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-[20px] ${
                    star <= Math.round(book.avgRating) ? 'text-secondary' : 'text-outline'
                  }`}
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-on-surface-variant text-sm">
              ({book.cntRating} đánh giá)
            </span>
            <span className="text-on-surface-variant text-sm">|</span>
            <span className="text-on-surface-variant text-sm">
              Đã bán {book.buyCount > 1000 ? `${(book.buyCount / 1000).toFixed(0)}k+` : book.buyCount}+
            </span>
          </div>

          {/* Price */}
          <div className="bg-surface-container-low rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="font-headline-lg text-headline-lg text-primary font-bold">
                {formatCurrency(book.price)}
              </span>
              {hasDiscount && (
                <span className="font-body-lg text-on-surface-variant line-through">
                  {formatCurrency(book.originalPrice || 0)}
                </span>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-sm">
              <div>
                <span className="text-on-surface-variant text-xs block">Nhà xuất bản</span>
                <span className="text-on-surface font-medium">{book.publisher || 'Đang cập nhật'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant text-xs block">Năm xuất bản</span>
                <span className="text-on-surface font-medium">{book.publishYear || 'Đang cập nhật'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant text-xs block">Số trang</span>
                <span className="text-on-surface font-medium">{book.pageCount ? `${book.pageCount} trang` : 'Đang cập nhật'}</span>
              </div>
              <div>
                <span className="text-on-surface-variant text-xs block">ISBN</span>
                <span className="text-on-surface font-medium">{book.isbn || 'Đang cập nhật'}</span>
              </div>
              <div className="col-span-2 pt-2.5 border-t border-outline-variant/40">
                <span className="text-on-surface-variant text-xs block mb-1.5 font-medium">Thể loại</span>
                <div className="flex flex-wrap gap-1.5">
                  {book.genres && book.genres.length > 0 ? (
                    book.genres.map((genre, idx) => (
                      <Link
                        key={idx}
                        to={`/books?keyword=${encodeURIComponent(genre)}`}
                        className="inline-flex items-center px-2.5 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                      >
                        {genre}
                      </Link>
                    ))
                  ) : (
                    <span className="text-on-surface font-medium">Đang cập nhật</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-on-surface-variant text-sm">Số lượng:</span>
            <div className="flex items-center border border-outline-variant rounded-lg">
              <button
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 h-10 flex items-center justify-center font-medium border-x border-outline-variant">
                {quantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className={`text-sm font-semibold ${book.quantityInStock > 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
              {book.quantityInStock > 0 ? `Còn ${book.quantityInStock} cuốn (Khả dụng)` : 'Hết hàng (0 cuốn khả dụng)'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-label-md rounded-lg hover:bg-primary-fixed transition-colors cursor-pointer"
            >
              <ShoppingCart size={20} />
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-label-md rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Zap size={20} />
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-10 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-outline-variant bg-surface-container-low">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 px-6 py-4 font-label-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'description'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">description</span>
              Mô tả sản phẩm
            </span>
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 px-6 py-4 font-label-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">list_alt</span>
              Thông số sản phẩm
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'description' && (
            <div>
              {book.description ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary text-[24px]">auto_stories</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Giới thiệu sách
                    </h3>
                  </div>
                  <div className="text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low rounded-lg p-5 border-l-4 border-primary">
                    {book.description}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[48px] text-outline mb-3">menu_book</span>
                  <p className="text-on-surface-variant font-medium">Chưa có mô tả cho sản phẩm này.</p>
                  <p className="text-on-surface-variant text-sm mt-1">Vui lòng liên hệ để biết thêm chi tiết.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-[24px]">info</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Thông tin chi tiết
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[20px]">book</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Tên sách</p>
                    <p className="font-label-md text-on-surface font-medium">{book.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Tác giả</p>
                    <p className="font-label-md text-on-surface font-medium">{book.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[20px]">business</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Nhà xuất bản</p>
                    <p className="font-label-md text-on-surface font-medium">{book.publisher || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Năm xuất bản</p>
                    <p className="font-label-md text-on-surface font-medium">{book.publishYear || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[20px]">qr_code</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">ISBN</p>
                    <p className="font-label-md text-on-surface font-medium">{book.isbn || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Thể loại</p>
                    <p className="font-label-md text-on-surface font-medium">
                      {book.genres?.length > 0 ? book.genres.join(', ') : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                  <div>
                    <p className="text-caption text-on-surface-variant">Tồn kho</p>
                    <p className="font-label-md text-on-surface font-medium">{book.quantityInStock} sản phẩm</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[24px]">reviews</span>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
            Đánh giá từ khách hàng
          </h2>
          {reviews.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary-fixed text-primary text-sm font-bold rounded-full">
              {reviews.length}
            </span>
          )}
        </div>

        {reviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-low rounded-lg p-4 animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-variant"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-variant rounded w-32"></div>
                    <div className="h-3 bg-surface-variant rounded w-20"></div>
                  </div>
                </div>
                <div className="h-4 bg-surface-variant rounded w-full"></div>
                <div className="h-4 bg-surface-variant rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.commentId}
                className="bg-surface-container-low rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">
                      {review.userName?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-label-md font-semibold text-on-surface">{review.userName || 'Ẩn danh'}</p>
                      <p className="text-caption text-on-surface-variant">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <p className="text-on-surface leading-relaxed">{review.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-[56px] text-outline mb-3">rate_review</span>
            <p className="font-medium text-on-surface-variant">Chưa có đánh giá nào cho sản phẩm này.</p>
            <p className="text-sm text-on-surface-variant mt-1">Hãy là người đầu tiên đánh giá sản phẩm!</p>
          </div>
        )}
      </div>
    </div>
  );
};

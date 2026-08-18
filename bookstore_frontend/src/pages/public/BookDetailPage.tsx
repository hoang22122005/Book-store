import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAddManyToCartMutation } from '../../features/cart';
import { useBookDetail } from '../../features/catalog/hooks/useBookDetail';
import { useSimilarBooks } from '../../features/catalog/hooks/useSimilarBooks';
import { useBookComments, useBookRatings } from '../../features/catalog/hooks/useCustomerReviews';
import {
  useCheckBookPurchased,
  useSubmitComment,
  useSubmitRating,
} from '../../features/catalog/hooks/useSubmitBookReview';
import { formatCurrency } from '../../utils';

const StarRating: React.FC<{ value: number; size?: string }> = ({ value, size = 'text-[18px]' }) => (
  <span className="inline-flex text-amber-500" aria-label={`${value} trên 5 sao`}>
    {Array.from({ length: 5 }).map((_, index) => (
      <span key={index} data-weight={index < Math.round(value) ? 'fill' : undefined} className={`material-symbols-outlined ${size}`}>
        star
      </span>
    ))}
  </span>
);

export const BookDetailPage: React.FC = () => {
  const { bookId: rawBookId } = useParams();
  const bookId = Number(rawBookId);
  const isValidBookId = Number.isInteger(bookId) && bookId > 0;
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const addToCart = useAddManyToCartMutation();
  const submitRatingMutation = useSubmitRating();
  const submitCommentMutation = useSubmitComment();
  const { data: hasPurchased } = useCheckBookPurchased(isValidBookId ? bookId : 0, isAuthenticated);
  const { data: book, isLoading, isError, refetch } = useBookDetail(isValidBookId ? bookId : 0);
  const { data: similarData, isLoading: isLoadingSimilar } = useSimilarBooks(isValidBookId ? bookId : 0, 0, 4);
  const { data: commentsData, isLoading: isLoadingComments } = useBookComments(isValidBookId ? bookId : 0, 12);
  const { data: ratingsData } = useBookRatings(isValidBookId ? bookId : 0, 100);
  const [quantityByBookId, setQuantityByBookId] = useState<Record<number, number>>({});
  const [failedImageBookIds, setFailedImageBookIds] = useState<Set<number>>(() => new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [selectedRatingByBookId, setSelectedRatingByBookId] = useState<Record<number, number>>({});
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [bookId]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const ratingByUser = useMemo(
    () => new Map((ratingsData?.content || []).map((rating) => [rating.userId, rating.ratingValue])),
    [ratingsData],
  );

  const quantity = quantityByBookId[bookId] ?? 1;
  const imageFailed = failedImageBookIds.has(bookId);
  const selectedRating = selectedRatingByBookId[bookId] ?? 5;

  const setQuantity = (updater: (current: number) => number) => {
    setQuantityByBookId((current) => ({ ...current, [bookId]: updater(current[bookId] ?? 1) }));
  };

  const setSelectedRating = (value: number) => {
    setSelectedRatingByBookId((current) => ({ ...current, [bookId]: value }));
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingError(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!hasPurchased) {
      setRatingError('Bạn cần mua cuốn sách này trước khi đánh giá.');
      return;
    }

    submitRatingMutation.mutate(
      { bookId, ratingValue: selectedRating },
      {
        onSuccess: () => {
          setMessage(`Đã gửi đánh giá ${selectedRating} sao thành công!`);
        },
        onError: (err) => setRatingError((err as Error).message || 'Không thể gửi đánh giá.'),
      },
    );
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!hasPurchased) {
      setCommentError('Bạn cần mua cuốn sách này trước khi bình luận.');
      return;
    }
    if (!reviewContent.trim()) {
      setCommentError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    submitCommentMutation.mutate(
      { bookId, content: reviewContent },
      {
        onSuccess: () => {
          setReviewContent('');
          setMessage('Đã gửi bình luận thành công!');
        },
        onError: (err) => setCommentError((err as Error).message || 'Không thể gửi bình luận.'),
      },
    );
  };

  const addBookToCart = (targetBookId: number, targetQuantity = 1, buyNow = false) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    addToCart.mutate(
      { bookId: targetBookId, quantity: targetQuantity },
      {
        onSuccess: () => {
          if (buyNow) {
            navigate(`/checkout?items=${targetBookId}`);
            return;
          }
          setMessage(`Đã thêm ${targetQuantity} sản phẩm vào giỏ hàng.`);
        },
        onError: (error) => setMessage((error as Error).message || 'Không thể thêm sách vào giỏ hàng.'),
      },
    );
  };

  if (!isValidBookId) {
    return (
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-outline">menu_book</span>
        <h1 className="text-2xl font-bold text-primary mt-3">Đường dẫn sách không hợp lệ</h1>
        <Link to="/" className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-primary text-white font-bold">Về trang chủ</Link>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 animate-pulse">
        <div className="h-5 w-48 bg-surface-variant rounded mb-8" />
        <div className="grid md:grid-cols-[minmax(280px,420px)_1fr] gap-10">
          <div className="aspect-[3/4] bg-surface-variant rounded-2xl" />
          <div className="space-y-5"><div className="h-12 bg-surface-variant rounded" /><div className="h-6 w-1/2 bg-surface-variant rounded" /><div className="h-28 bg-surface-variant rounded" /></div>
        </div>
      </main>
    );
  }

  if (isError || !book) {
    return (
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-16 text-center">
        <span className="material-symbols-outlined text-6xl text-error">error</span>
        <h1 className="text-2xl font-bold text-primary mt-3">Không thể tải thông tin sách</h1>
        <button onClick={() => refetch()} className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-white font-bold cursor-pointer">Thử lại</button>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-6 md:py-10 space-y-12">
      {message && <div className="fixed right-5 bottom-5 z-50 max-w-sm rounded-xl bg-primary text-white px-4 py-3 shadow-xl">{message}</div>}

      <nav className="flex items-center gap-2 text-sm text-on-surface-variant" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Trang chủ</Link><span>/</span><span className="text-on-surface line-clamp-1">{book.title}</span>
      </nav>

      <section className="grid grid-cols-1 md:grid-cols-[minmax(300px,420px)_1fr] gap-8 lg:gap-12 items-start">
        <div className="relative aspect-[3/4] rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-sm overflow-hidden">
          {book.coverUrl && !imageFailed ? (
            <img src={book.coverUrl} alt={`Bìa sách ${book.title}`} onError={() => setFailedImageBookIds((current) => new Set(current).add(bookId))} className="absolute inset-0 w-full h-full object-contain p-6" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-on-surface-variant"><span className="material-symbols-outlined text-7xl">menu_book</span><span>Chưa có ảnh bìa</span></div>
          )}
          {book.discountPercent !== undefined && <span className="absolute top-4 left-4 rounded-full bg-error text-white text-sm font-bold px-3 py-1">-{book.discountPercent}%</span>}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">{book.genres?.map((genre) => <span key={genre} className="rounded-full bg-primary-fixed text-primary px-3 py-1 text-xs font-bold">{genre}</span>)}</div>
            <h1 className="text-3xl lg:text-4xl font-bold text-primary leading-tight">{book.title}</h1>
            <p className="mt-2 text-lg text-on-surface-variant">Tác giả: <strong className="text-on-surface">{book.author}</strong></p>
          </div>

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-surface-variant">
            <span className="flex items-center gap-2"><StarRating value={book.avgRating} /><strong>{book.avgRating.toFixed(1)}</strong><span className="text-sm text-on-surface-variant">({book.cntRating} đánh giá)</span></span>
            <span className="text-sm text-on-surface-variant">Đã bán: <strong className="text-on-surface">{book.buyCount}</strong></span>
            <span className={book.quantityInStock > 0 ? 'text-emerald-500 font-bold text-sm' : 'text-rose-400 font-bold text-sm'}>{book.quantityInStock > 0 ? `Còn ${book.quantityInStock} cuốn (Khả dụng)` : 'Hết hàng (0 cuốn khả dụng)'}</span>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-5 flex flex-wrap items-baseline gap-3">
            <strong className="text-3xl text-primary">{formatCurrency(book.price)}</strong>
            {book.originalPrice && <span className="text-lg text-outline line-through">{formatCurrency(book.originalPrice)}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-surface-variant p-5 text-sm">
            <div><span className="block text-on-surface-variant">Nhà xuất bản</span><strong>{book.publisher || 'Đang cập nhật'}</strong></div>
            <div><span className="block text-on-surface-variant">Năm xuất bản</span><strong>{book.publishYear || 'Đang cập nhật'}</strong></div>
            <div><span className="block text-on-surface-variant">Số trang</span><strong>{book.pageCount ? `${book.pageCount} trang` : 'Đang cập nhật'}</strong></div>
            <div><span className="block text-on-surface-variant">ISBN</span><strong>{book.isbn || 'Đang cập nhật'}</strong></div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold">Số lượng</span>
            <div className="inline-flex items-center rounded-xl border border-surface-variant overflow-hidden">
              <button onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity === 1} className="w-11 h-11 hover:bg-surface-container disabled:opacity-40 cursor-pointer"><span className="material-symbols-outlined">remove</span></button>
              <strong className="w-12 text-center">{quantity}</strong>
              <button onClick={() => setQuantity((current) => current + 1)} className="w-11 h-11 hover:bg-surface-container disabled:opacity-40 cursor-pointer"><span className="material-symbols-outlined">add</span></button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => addBookToCart(book.id, quantity)} disabled={addToCart.isPending} className="min-h-12 rounded-xl bg-primary-fixed text-primary font-bold hover:bg-primary hover:text-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"><span className="material-symbols-outlined">add_shopping_cart</span>Thêm vào giỏ hàng</button>
            <button onClick={() => addBookToCart(book.id, quantity, true)} disabled={addToCart.isPending} className="min-h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"><span className="material-symbols-outlined">bolt</span>Mua ngay</button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface-container-lowest border border-surface-variant p-6 md:p-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Mô tả sách</h2>
        <p className="text-on-surface-variant leading-8 whitespace-pre-line">{book.description || 'Nội dung mô tả đang được cập nhật.'}</p>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-primary">Đánh giá & Bình luận</h2>
            <p className="text-sm text-on-surface-variant mt-1">Cảm nhận và chia sẻ của độc giả về cuốn sách này.</p>
          </div>
          <div className="text-right">
            <strong className="text-3xl text-primary">{book.avgRating.toFixed(1)}</strong>
            <div><StarRating value={book.avgRating} /></div>
            <p className="text-xs text-on-surface-variant mt-0.5">{book.cntRating} lượt đánh giá</p>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="rounded-2xl border border-surface-variant bg-surface-container-low p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">lock</span>
            <p className="font-semibold text-on-surface">Bạn cần đăng nhập và mua sách này để có thể đánh giá và bình luận</p>
            <button
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
              className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-secondary cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : !hasPurchased ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 flex items-center gap-3.5 text-amber-900 dark:text-amber-200">
            <span className="material-symbols-outlined text-3xl text-amber-500 shrink-0">verified_user</span>
            <div>
              <p className="font-bold text-sm">Chỉ độc giả đã mua cuốn sách này mới có thể đánh giá và bình luận</p>
              <p className="text-xs opacity-80 mt-0.5">Hãy đặt mua cuốn sách để trải nghiệm và chia sẻ cảm nhận chân thực nhất của bạn nhé!</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Box 1: Đánh giá sao */}
            <div className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-5 md:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">star</span>
                  <h3 className="font-bold text-lg text-on-surface">Đánh giá số sao</h3>
                </div>
                <p className="text-sm text-on-surface-variant mb-4">
                  Bạn có thể đánh giá nhiều lần để cập nhật cảm nhận của mình.
                </p>
                <div className="flex items-center gap-1.5 py-3" role="radiogroup" aria-label="Chọn số sao">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selectedRating === value}
                        aria-label={`${value} sao`}
                        onClick={() => setSelectedRating(value)}
                        className="p-1 text-amber-500 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <span data-weight={value <= selectedRating ? 'fill' : undefined} className="material-symbols-outlined text-[36px]">
                          star
                        </span>
                      </button>
                    );
                  })}
                  <span className="ml-3 font-bold text-lg text-amber-500">{selectedRating} / 5 sao</span>
                </div>
              </div>

              {ratingError && <p className="text-xs font-semibold text-error mb-3">{ratingError}</p>}

              <button
                type="button"
                onClick={handleRatingSubmit}
                disabled={submitRatingMutation.isPending}
                className="mt-4 w-full rounded-xl bg-amber-500 text-slate-950 font-bold py-3 hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">grade</span>
                {submitRatingMutation.isPending ? 'Đang lưu đánh giá...' : 'Gửi đánh giá sao'}
              </button>
            </div>

            {/* Box 2: Viết bình luận */}
            <div className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-5 md:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-2xl">chat</span>
                  <h3 className="font-bold text-lg text-on-surface">Viết bình luận</h3>
                </div>
                <p className="text-sm text-on-surface-variant mb-3">
                  Chia sẻ nhận xét hoặc thảo luận về nội dung cuốn sách.
                </p>
                <textarea
                  value={reviewContent}
                  onChange={(event) => setReviewContent(event.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Viết cảm nhận của bạn về cuốn sách này..."
                  className="w-full resize-none rounded-xl border border-surface-variant bg-surface px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed"
                />
              </div>

              {commentError && <p className="text-xs font-semibold text-error my-2">{commentError}</p>}

              <button
                type="button"
                onClick={handleCommentSubmit}
                disabled={submitCommentMutation.isPending}
                className="mt-4 w-full rounded-xl bg-primary text-white font-bold py-3 hover:bg-secondary disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                {submitCommentMutation.isPending ? 'Đang gửi bình luận...' : 'Gửi bình luận'}
              </button>
            </div>
          </div>
        )}

        {/* Danh sách bình luận & đánh giá */}
        <div>
          <h3 className="text-lg font-bold text-on-surface mb-4">Danh sách bình luận độc giả</h3>
          {isLoadingComments ? (
            <div className="h-32 rounded-2xl bg-surface-variant animate-pulse" />
          ) : commentsData?.content.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {commentsData.content.map((comment) => {
                const rating = ratingByUser.get(comment.userId);
                return (
                  <article key={comment.commentId} className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-5">
                    <div className="flex justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {(comment.userName || 'Đ').charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <strong className="block truncate">{comment.userName || 'Độc giả'}</strong>
                          <span className="text-xs text-on-surface-variant">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      {rating ? <StarRating value={rating} size="text-[16px]" /> : null}
                    </div>
                    <p className="text-on-surface-variant leading-7">{comment.content}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-surface-container-low p-6 text-on-surface-variant">Chưa có bình luận cho cuốn sách này.</div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-5"><h2 className="text-2xl font-bold text-primary">Sách tương tự</h2><p className="text-sm text-on-surface-variant mt-1">Những cuốn sách có nội dung gần với lựa chọn của bạn.</p></div>
        {isLoadingSimilar ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-80 rounded-2xl bg-surface-variant animate-pulse" />)}</div> : similarData?.content.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{similarData.content.map((similar) => <article key={similar.id} className="rounded-2xl border border-surface-variant bg-surface-container-lowest overflow-hidden flex flex-col"><Link to={`/books/${similar.id}`} className="aspect-[3/4] bg-surface-container-low relative overflow-hidden">{similar.coverUrl ? <img src={similar.coverUrl} alt={similar.title} className="w-full h-full object-contain p-4 hover:scale-105 transition-transform" /> : <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-6xl text-outline">menu_book</span>}</Link><div className="p-4 flex flex-col gap-2 flex-1"><Link to={`/books/${similar.id}`} className="font-bold text-on-surface line-clamp-2 hover:text-primary">{similar.title}</Link><span className="text-xs text-on-surface-variant line-clamp-1">{similar.author}</span><span className="flex items-center gap-1 text-sm"><StarRating value={similar.avgRating} size="text-[15px]" /><span>{similar.avgRating.toFixed(1)}</span><span className="text-on-surface-variant">({similar.cntRating})</span></span><div className="mt-auto flex items-center justify-between gap-2 pt-2"><strong className="text-primary">{formatCurrency(similar.price)}</strong><button onClick={() => addBookToCart(similar.id)} disabled={similar.quantityInStock <= 0 || addToCart.isPending} className="w-9 h-9 rounded-full bg-primary text-white disabled:opacity-40 flex items-center justify-center cursor-pointer" title="Thêm vào giỏ hàng"><span className="material-symbols-outlined text-[18px]">add_shopping_cart</span></button></div></div></article>)}</div>
        ) : <div className="rounded-2xl bg-surface-container-low p-6 text-on-surface-variant">Chưa tìm thấy sách tương tự.</div>}
      </section>
    </main>
  );
};

export default BookDetailPage;

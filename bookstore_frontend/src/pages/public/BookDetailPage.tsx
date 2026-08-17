import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAddManyToCartMutation } from '../../features/cart';
import { useBookDetail } from '../../features/catalog/hooks/useBookDetail';
import { useSimilarBooks } from '../../features/catalog/hooks/useSimilarBooks';
import { useBookComments, useBookRatings } from '../../features/catalog/hooks/useCustomerReviews';
import { useSubmitBookReview } from '../../features/catalog/hooks/useSubmitBookReview';
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
  const submitReview = useSubmitBookReview();
  const { data: book, isLoading, isError, refetch } = useBookDetail(isValidBookId ? bookId : 0);
  const { data: similarData, isLoading: isLoadingSimilar } = useSimilarBooks(isValidBookId ? bookId : 0, 0, 4);
  const { data: commentsData, isLoading: isLoadingComments } = useBookComments(isValidBookId ? bookId : 0, 8);
  const { data: ratingsData } = useBookRatings(isValidBookId ? bookId : 0, 100);
  const [quantityByBookId, setQuantityByBookId] = useState<Record<number, number>>({});
  const [failedImageBookIds, setFailedImageBookIds] = useState<Set<number>>(() => new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [selectedRatingByBookId, setSelectedRatingByBookId] = useState<Record<number, number>>({});
  const [reviewError, setReviewError] = useState<string | null>(null);

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

  const existingUserRating = useMemo(() => {
    const currentUserId = Number(user?.id);
    if (!Number.isFinite(currentUserId)) return undefined;
    return ratingsData?.content.find((rating) => rating.userId === currentUserId);
  }, [ratingsData, user?.id]);

  const quantity = quantityByBookId[bookId] ?? 1;
  const imageFailed = failedImageBookIds.has(bookId);
  const selectedRating = selectedRatingByBookId[bookId] ?? existingUserRating?.ratingValue ?? 0;

  const setQuantity = (updater: (current: number) => number) => {
    setQuantityByBookId((current) => ({ ...current, [bookId]: updater(current[bookId] ?? 1) }));
  };

  const setSelectedRating = (value: number) => {
    setSelectedRatingByBookId((current) => ({ ...current, [bookId]: value }));
  };

  const handleSubmitReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewError(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (selectedRating < 1 || selectedRating > 5) {
      setReviewError('Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (!reviewContent.trim()) {
      setReviewError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    submitReview.mutate(
      {
        bookId,
        content: reviewContent,
        ratingValue: selectedRating,
        existingRatingId: existingUserRating?.ratingId,
      },
      {
        onSuccess: () => {
          setReviewContent('');
          setMessage(existingUserRating ? 'Đã cập nhật đánh giá và gửi bình luận.' : 'Đã gửi đánh giá và bình luận.');
        },
        onError: (error) => setReviewError((error as Error).message || 'Không thể gửi đánh giá lúc này.'),
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
            <span className={book.quantityInStock > 0 ? 'text-green-700 font-bold text-sm' : 'text-error font-bold text-sm'}>{book.quantityInStock > 0 ? `Còn ${book.quantityInStock} cuốn` : 'Hết hàng'}</span>
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



          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => addBookToCart(book.id, quantity)} disabled={book.quantityInStock <= 0 || addToCart.isPending} className="min-h-12 rounded-xl bg-primary-fixed text-primary font-bold hover:bg-primary hover:text-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"><span className="material-symbols-outlined">add_shopping_cart</span>Thêm vào giỏ hàng</button>
            <button onClick={() => addBookToCart(book.id, quantity, true)} disabled={book.quantityInStock <= 0 || addToCart.isPending} className="min-h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"><span className="material-symbols-outlined">bolt</span>Mua ngay</button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface-container-lowest border border-surface-variant p-6 md:p-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Mô tả sách</h2>
        <p className="text-on-surface-variant leading-8 whitespace-pre-line">{book.description || 'Nội dung mô tả đang được cập nhật.'}</p>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-5"><div><h2 className="text-2xl font-bold text-primary">Đánh giá & bình luận</h2><p className="text-sm text-on-surface-variant mt-1">Cảm nhận của độc giả về cuốn sách.</p></div><div className="text-right"><strong className="text-3xl text-primary">{book.avgRating.toFixed(1)}</strong><div><StarRating value={book.avgRating} /></div></div></div>
        <form onSubmit={handleSubmitReview} className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-5 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Viết đánh giá của bạn</h3>
              <p className="text-sm text-on-surface-variant">{isAuthenticated ? 'Chọn số sao và chia sẻ cảm nhận về cuốn sách.' : 'Bạn cần đăng nhập để gửi đánh giá.'}</p>
            </div>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Chọn số sao">
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
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <span data-weight={value <= selectedRating ? 'fill' : undefined} className="material-symbols-outlined text-[30px]">star</span>
                  </button>
                );
              })}
            </div>
          </div>
          <textarea
            value={reviewContent}
            onChange={(event) => setReviewContent(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Cuốn sách này mang lại cho bạn điều gì?"
            className="w-full resize-y rounded-xl border border-surface-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div>{reviewError && <p className="text-sm font-medium text-error">{reviewError}</p>}</div>
            <button type="submit" disabled={submitReview.isPending} className="rounded-xl bg-primary text-white font-bold px-5 py-2.5 hover:bg-secondary disabled:opacity-50 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[19px]">rate_review</span>
              {submitReview.isPending ? 'Đang gửi...' : existingUserRating ? 'Cập nhật & bình luận' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
        {isLoadingComments ? <div className="h-32 rounded-2xl bg-surface-variant animate-pulse" /> : commentsData?.content.length ? (
          <div className="grid md:grid-cols-2 gap-4">{commentsData.content.map((comment) => { const rating = ratingByUser.get(comment.userId); return <article key={comment.commentId} className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-5"><div className="flex justify-between gap-3 mb-3"><div className="flex items-center gap-3 min-w-0"><span className="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold">{(comment.userName || 'Đ').charAt(0).toUpperCase()}</span><div className="min-w-0"><strong className="block truncate">{comment.userName || 'Độc giả'}</strong><span className="text-xs text-on-surface-variant">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span></div></div>{rating ? <StarRating value={rating} size="text-[16px]" /> : null}</div><p className="text-on-surface-variant leading-7">{comment.content}</p></article>; })}</div>
        ) : <div className="rounded-2xl bg-surface-container-low p-6 text-on-surface-variant">Chưa có bình luận cho cuốn sách này.</div>}
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

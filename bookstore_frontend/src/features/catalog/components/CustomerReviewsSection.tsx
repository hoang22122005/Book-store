import React from 'react';
import { useCustomerReviews } from '../hooks/useCustomerReviews';

const FALLBACK_REVIEWS = [
  {
    id: 'r1',
    userName: 'Nguyễn Văn A',
    bookName: 'Đắc Nhân Tâm',
    content: 'Một cuốn sách thay đổi hoàn toàn tư duy của tôi về cuộc sống. Rất đáng đọc!',
    ratingValue: 5,
  },
  {
    id: 'r2',
    userName: 'Trần Thị B',
    bookName: 'Nhà Giả Kim',
    content: 'Giao hàng nhanh, đóng gói cẩn thận. Sách in đẹp, nội dung sâu sắc.',
    ratingValue: 5,
  },
  {
    id: 'r3',
    userName: 'Lê Hoàng C',
    bookName: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
    content: 'Quyển sách truyền cảm hứng rất lớn cho người trẻ. Giao diện mua hàng cực mượt!',
    ratingValue: 5,
  },
];

export const CustomerReviewsSection: React.FC = () => {
  const { data, isLoading, isError, refetch } = useCustomerReviews(3);

  const comments = data?.content || [];
  const reviewsToDisplay = comments.length > 0
    ? comments.map((c) => ({
        id: String(c.commentId),
        userName: c.userName || 'Độc giả',
        bookName: c.bookName || 'Sách',
        content: c.content,
        ratingValue: 5,
      }))
    : FALLBACK_REVIEWS;

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg bg-primary text-white rounded-xl my-stack-lg">
      <h2 className="font-headline-md text-headline-md mb-stack-lg text-center font-bold">
        Đánh giá cao từ độc giả
      </h2>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 p-stack-md rounded-lg backdrop-blur-sm animate-pulse space-y-4">
              <div className="h-4 bg-white/20 rounded w-24"></div>
              <div className="h-12 bg-white/20 rounded w-full"></div>
              <div className="h-8 bg-white/20 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="text-sm font-medium">Không thể kết nối đến máy chủ nhận xét.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-error text-white text-xs font-bold rounded-md hover:opacity-90 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Success / Fallback */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {reviewsToDisplay.map((review) => (
            <div
              key={review.id}
              className="bg-white/10 p-stack-md rounded-lg backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex text-secondary-container mb-stack-sm">
                  {Array.from({ length: review.ratingValue }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[20px]">
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md italic mb-stack-sm text-white/95 leading-relaxed line-clamp-3">
                  "{review.content}"
                </p>
              </div>
              <div className="flex items-center gap-stack-sm pt-2">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-xs">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-label-md font-semibold line-clamp-1">{review.userName}</p>
                  <p className="text-caption opacity-70 line-clamp-1">Về '{review.bookName}'</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

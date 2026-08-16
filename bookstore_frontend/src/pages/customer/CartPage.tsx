import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useCartDetailsQuery,
  useIncreaseCartQuantityMutation,
  useDecreaseCartQuantityMutation,
  useDeleteCartDetailMutation,
} from '../../features/cart';
import { formatCurrency } from '../../utils';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading, isError, error, refetch } = useCartDetailsQuery();

  const increaseMutation = useIncreaseCartQuantityMutation();
  const decreaseMutation = useDecreaseCartQuantityMutation();
  const deleteMutation = useDeleteCartDetailMutation();

  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);

  // Toggle single item selection
  const handleToggleSelect = (bookId: number) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (selectedBookIds.length === cartItems.length) {
      setSelectedBookIds([]);
    } else {
      setSelectedBookIds(cartItems.map((item) => item.bookId));
    }
  };

  // Filter selected cart items
  const activeSelectedItems = cartItems.filter((item) =>
    selectedBookIds.includes(item.bookId)
  );

  // Subtotal calculation
  const subTotal = activeSelectedItems.reduce((acc, item) => {
    const itemPrice = item.salePrice ? Number(item.salePrice) : Number(item.price);
    return acc + itemPrice * item.quantity;
  }, 0);

  const handleProceedToCheckout = () => {
    if (activeSelectedItems.length === 0) return;
    const selectedIdsParam = activeSelectedItems.map((item) => item.bookId).join(',');
    navigate(`/checkout?items=${selectedIdsParam}`);
  };

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-md">
      {/* Page Title */}
      <div className="mb-stack-md">
        <h1 className="font-headline-md text-headline-md text-primary font-bold">
          Giỏ hàng của bạn
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Quản lý các sản phẩm bạn đã chọn trước khi tiến hành thanh toán
        </p>
      </div>

      {isLoading && (
        <div className="py-16 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant font-medium">Đang tải giỏ hàng...</p>
        </div>
      )}

      {isError && (
        <div className="bg-error-container text-on-error-container p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-3xl">error</span>
            <p className="font-medium text-body-md">
              {(error as Error)?.message || 'Không thể tải thông tin giỏ hàng từ máy chủ.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-error text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {!isLoading && !isError && cartItems.length === 0 && (
        <div className="py-20 text-center bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-5xl">shopping_cart</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-headline-sm font-bold text-on-surface">Giỏ hàng của bạn đang trống</h2>
            <p className="text-on-surface-variant max-w-md mx-auto text-body-md">
              Chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá kho sách đa dạng của chúng tôi để chọn được cuốn sách ưng ý nhất!
            </p>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-secondary transition-colors shadow-md cursor-pointer"
          >
            <span>Khám phá sách ngay</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      )}

      {!isLoading && !isError && cartItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg items-start">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select all header bar */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex items-center justify-between shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedBookIds.length === cartItems.length && cartItems.length > 0}
                  onChange={handleToggleSelectAll}
                  className="w-5 h-5 rounded accent-primary cursor-pointer"
                />
                <span className="font-semibold text-on-surface text-body-md">
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </span>
              </label>
              <span className="text-caption text-on-surface-variant">
                Đã chọn: <strong className="text-primary">{selectedBookIds.length}</strong>
              </span>
            </div>

            {/* List of Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => {
                const isSelected = selectedBookIds.includes(item.bookId);
                const displayPrice = item.salePrice ? Number(item.salePrice) : Number(item.price);
                const isDiscounted = item.salePrice && Number(item.salePrice) < Number(item.price);

                return (
                  <div
                    key={item.bookId}
                    className={`bg-surface-container-lowest border rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all ${
                      isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.bookId)}
                        className="w-5 h-5 rounded accent-primary cursor-pointer flex-shrink-0"
                      />

                      {/* Image */}
                      <div className="w-16 h-22 bg-surface-variant rounded-md flex-shrink-0 overflow-hidden relative border border-surface-variant">
                        {item.urlImg ? (
                          <img
                            src={item.urlImg}
                            alt={item.bookName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-outline">
                            <span className="material-symbols-outlined">menu_book</span>
                          </div>
                        )}
                      </div>

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/books/${item.bookId}`}
                          className="font-semibold text-on-surface hover:text-secondary transition-colors line-clamp-1 text-body-md"
                        >
                          {item.bookName}
                        </Link>
                        <p className="text-caption text-on-surface-variant mt-0.5">
                          Tác giả: {item.author || 'Nhiều tác giả'}
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-bold text-primary text-body-md">
                            {formatCurrency(displayPrice)}
                          </span>
                          {isDiscounted && (
                            <span className="text-caption text-outline line-through">
                              {formatCurrency(Number(item.price))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls & Delete */}
                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-surface-variant">
                      <div className="flex items-center border border-surface-variant rounded-lg overflow-hidden bg-surface">
                        <button
                          onClick={() => decreaseMutation.mutate(item.bookId)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant text-on-surface disabled:opacity-40 transition-colors cursor-pointer"
                          title="Giảm số lượng"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="w-10 text-center font-semibold text-sm select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseMutation.mutate(item.bookId)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-surface-variant text-on-surface disabled:opacity-40 transition-colors cursor-pointer"
                          title="Tăng số lượng"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-on-surface text-body-md w-24 text-right hidden sm:block">
                          {formatCurrency(displayPrice * item.quantity)}
                        </span>
                        <button
                          onClick={() => deleteMutation.mutate(item.bookId)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error-container/20 cursor-pointer"
                          title="Xóa khỏi giỏ hàng"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-6 sticky top-28">
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary pb-3 border-b border-surface-variant">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Số lượng sản phẩm chọn:</span>
                <span className="font-semibold text-on-surface">{activeSelectedItems.length}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Tổng tiền hàng:</span>
                <span className="font-semibold text-on-surface">{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-secondary">Miễn phí</span>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-variant flex justify-between items-baseline">
              <span className="font-bold text-on-surface text-body-md">Tạm tính:</span>
              <span className="font-bold text-headline-sm text-primary">
                {formatCurrency(subTotal)}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={activeSelectedItems.length === 0}
              className="w-full py-3.5 px-6 bg-primary text-white font-bold rounded-xl hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-body-md cursor-pointer"
            >
              <span>Tiến hành thanh toán</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

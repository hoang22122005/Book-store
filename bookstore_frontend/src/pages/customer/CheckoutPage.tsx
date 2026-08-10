import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCartDetailsQuery } from '../../features/cart';
import { useMyVouchersQuery } from '../../features/vouchers';
import { useCheckoutMutation } from '../../features/checkout';
import { formatCurrency } from '../../utils';
import type { VoucherResponse } from '../../types/api/voucher';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query selected items from URL params
  const itemsParam = searchParams.get('items');
  const selectedBookIds = useMemo(() => {
    if (!itemsParam) return [];
    return itemsParam
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);
  }, [itemsParam]);

  const { data: cartItems = [], isLoading: isCartLoading } = useCartDetailsQuery();
  const { data: vouchersPage, isLoading: isVouchersLoading } = useMyVouchersQuery();
  const checkoutMutation = useCheckoutMutation();

  // Filter items in checkout
  const checkoutItems = useMemo(() => {
    if (selectedBookIds.length === 0) return cartItems;
    return cartItems.filter((item) => selectedBookIds.includes(item.bookId));
  }, [cartItems, selectedBookIds]);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<'DIRECT' | 'VNPAY'>('DIRECT');
  const [bankCode, setBankCode] = useState<string>('NCB');
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>('');
  const [manualVoucherCode, setManualVoucherCode] = useState<string>('');
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherResponse | null>(null);

  // Subtotal calculation
  const subTotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => {
      const price = item.salePrice ? Number(item.salePrice) : Number(item.price);
      return acc + price * item.quantity;
    }, 0);
  }, [checkoutItems]);

  // Discount percentage calculation
  const discountPercent = appliedVoucher ? Number(appliedVoucher.discountPercent || 0) : 0;
  const discountAmount = useMemo(() => {
    if (!discountPercent) return 0;
    return (subTotal * discountPercent) / 100;
  }, [subTotal, discountPercent]);

  const finalTotal = Math.max(0, subTotal - discountAmount);

  // Filter only usable vouchers (not used and not expired)
  const availableVouchers = useMemo(() => {
    const all = vouchersPage?.content || [];
    const now = new Date();
    return all.filter((v) => {
      if (v.used) return false;
      if (v.expiredAt && new Date(v.expiredAt) < now) return false;
      return true;
    });
  }, [vouchersPage]);

  // Apply selected voucher from list
  const handleSelectVoucher = (voucher: VoucherResponse) => {
    setAppliedVoucher(voucher);
    setSelectedVoucherCode(voucher.code);
    setManualVoucherCode(voucher.code);
    setShowVoucherModal(false);
  };

  // Apply manual voucher code
  const handleApplyManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    const codeToSearch = manualVoucherCode.trim().toUpperCase();
    if (!codeToSearch) {
      setAppliedVoucher(null);
      setSelectedVoucherCode('');
      return;
    }

    const matched = availableVouchers.find(
      (v) => v.code.toUpperCase() === codeToSearch && !v.used
    );
    if (matched) {
      setAppliedVoucher(matched);
      setSelectedVoucherCode(matched.code);
    } else {
      // Allow applying even if not pre-fetched in page (backend will validate global code)
      setAppliedVoucher({
        voucherId: 0,
        code: codeToSearch,
        scope: 'GLOBAL',
        discountPercent: 10, // Preview default rate or text
        expiredAt: '',
      });
      setSelectedVoucherCode(codeToSearch);
    }
  };

  const handleClearVoucher = () => {
    setAppliedVoucher(null);
    setSelectedVoucherCode('');
    setManualVoucherCode('');
  };

  // Submit checkout
  const handleSubmitCheckout = () => {
    if (checkoutItems.length === 0) return;

    checkoutMutation.mutate(
      {
        selectedBookIds: checkoutItems.map((item) => item.bookId),
        voucherCode: selectedVoucherCode || null,
        paymentMethod: paymentMethod,
        bankCode: paymentMethod === 'VNPAY' ? bankCode : null,
      },
      {
        onSuccess: (data) => {
          if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
          } else {
            navigate('/order-success', { state: { checkoutData: data } });
          }
        },
      }
    );
  };

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-md">
      {/* Header breadcrumb / back */}
      <div className="mb-stack-md flex items-center justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Thanh toán đơn hàng
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Xác nhận thông tin sản phẩm, áp dụng ưu đãi và lựa chọn phương thức thanh toán
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Quay lại giỏ hàng</span>
        </Link>
      </div>

      {isCartLoading && (
        <div className="py-16 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant font-medium">Đang chuẩn bị thông tin thanh toán...</p>
        </div>
      )}

      {!isCartLoading && checkoutItems.length === 0 && (
        <div className="py-16 text-center bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 space-y-4">
          <span className="material-symbols-outlined text-5xl text-outline">remove_shopping_cart</span>
          <h2 className="text-headline-sm font-bold text-on-surface">Không tìm thấy sản phẩm cần thanh toán</h2>
          <p className="text-on-surface-variant text-body-md">
            Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán.
          </p>
          <Link
            to="/cart"
            className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-secondary transition-colors"
          >
            Đến giỏ hàng
          </Link>
        </div>
      )}

      {!isCartLoading && checkoutItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-lg items-start">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Selected items section */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">shopping_bag</span>
                Danh sách sản phẩm ({checkoutItems.length})
              </h2>

              <div className="divide-y divide-surface-variant">
                {checkoutItems.map((item) => {
                  const displayPrice = item.salePrice ? Number(item.salePrice) : Number(item.price);
                  return (
                    <div key={item.bookId} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-16 bg-surface-variant rounded flex-shrink-0 overflow-hidden border border-surface-variant">
                          {item.urlImg ? (
                            <img src={item.urlImg} alt={item.bookName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline">
                              <span className="material-symbols-outlined text-sm">book</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-on-surface text-body-md truncate">
                            {item.bookName}
                          </h3>
                          <p className="text-caption text-on-surface-variant">
                            Số lượng: {item.quantity} x {formatCurrency(displayPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="font-bold text-primary text-body-md text-right">
                        {formatCurrency(displayPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Voucher scan & application section */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">confirmation_number</span>
                  Mã giảm giá / Voucher
                </h2>
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(true)}
                  className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">view_list</span>
                  <span>Chọn voucher khả dụng ({availableVouchers.length})</span>
                </button>
              </div>

              {/* Input manual code */}
              <form onSubmit={handleApplyManualCode} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualVoucherCode}
                    onChange={(e) => setManualVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher (vd: SUMMER2026)..."
                    className="w-full px-4 py-2.5 bg-surface border border-surface-variant rounded-xl text-body-md uppercase tracking-wider focus:outline-none focus:border-primary font-mono"
                  />
                  {appliedVoucher && (
                    <button
                      type="button"
                      onClick={handleClearVoucher}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error cursor-pointer"
                      title="Bỏ áp dụng"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  Áp dụng
                </button>
              </form>

              {/* Status of applied voucher */}
              {appliedVoucher && (
                <div className="bg-secondary-container text-on-secondary-container p-3 rounded-xl flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">verified</span>
                    <span>
                      Đã áp dụng voucher <strong className="font-mono font-bold">{appliedVoucher.code}</strong> (-{appliedVoucher.discountPercent}%)
                    </span>
                  </div>
                  <span className="font-bold text-secondary">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* 3. Payment Method Section */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">payments</span>
                Phương thức thanh toán
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DIRECT COD Option */}
                <label
                  className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'DIRECT'
                      ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary'
                      : 'border-surface-variant hover:border-outline'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DIRECT"
                    checked={paymentMethod === 'DIRECT'}
                    onChange={() => setPaymentMethod('DIRECT')}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <span className="font-bold text-on-surface block text-body-md">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="text-caption text-on-surface-variant block mt-0.5">
                      Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sách.
                    </span>
                  </div>
                </label>

                {/* VNPAY Option */}
                <label
                  className={`p-4 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === 'VNPAY'
                      ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary'
                      : 'border-surface-variant hover:border-outline'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={() => setPaymentMethod('VNPAY')}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <span className="font-bold text-on-surface block text-body-md flex items-center gap-2">
                      <span>Cổng thanh toán VNPay</span>
                      <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-bold">Thẻ / QR</span>
                    </span>
                    <span className="text-caption text-on-surface-variant block mt-0.5">
                      Thanh toán online nhanh chóng bằng ứng dụng ngân hàng hoặc thẻ ATM/Visa/MasterCard.
                    </span>
                  </div>
                </label>
              </div>

              {/* Select Bank code if VNPAY */}
              {paymentMethod === 'VNPAY' && (
                <div className="pt-3 space-y-2 border-t border-surface-variant">
                  <label className="text-caption font-semibold text-on-surface-variant block">
                    Chọn ngân hàng / Cổng thanh toán VNPay:
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-surface-variant rounded-xl text-body-md font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="NCB">Ngân hàng NCB (Cổng Test Sandbox)</option>
                    <option value="MBBANK">Ngân hàng MBBank</option>
                    <option value="VIETCOMBANK">Ngân hàng Vietcombank</option>
                    <option value="VNPAYQR">Thanh toán qua VNPAY-QR</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Summary Side Card */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-6 sticky top-28">
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary pb-3 border-b border-surface-variant">
              Chi tiết thanh toán
            </h2>

            <div className="space-y-3 text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Tổng tiền hàng:</span>
                <span className="font-semibold text-on-surface">{formatCurrency(subTotal)}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-secondary">
                  <span>Giảm giá ({appliedVoucher.code}):</span>
                  <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-secondary">Miễn phí</span>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-variant flex justify-between items-baseline">
              <span className="font-bold text-on-surface text-body-md">Tổng thanh toán:</span>
              <span className="font-bold text-headline-sm text-primary">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {checkoutMutation.isError && (
              <div className="p-3 bg-error-container text-on-error-container text-xs rounded-xl font-medium">
                {(checkoutMutation.error as Error).message || 'Có lỗi xảy ra khi tạo đơn hàng'}
              </div>
            )}

            <button
              onClick={handleSubmitCheckout}
              disabled={checkoutMutation.isPending}
              className="w-full py-3.5 px-6 bg-primary text-white font-bold rounded-xl hover:bg-secondary disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 text-body-md cursor-pointer"
            >
              {checkoutMutation.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý đơn hàng...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận đặt hàng</span>
                  <span className="material-symbols-outlined text-sm">check</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Voucher Selection Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-surface-variant">
              <h3 className="font-headline-sm font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">local_activity</span>
                Danh sách Voucher của bạn
              </h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-on-surface-variant hover:text-error cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {isVouchersLoading && (
              <div className="py-8 text-center text-on-surface-variant">
                Đang tải danh sách voucher...
              </div>
            )}

            {!isVouchersLoading && availableVouchers.length === 0 && (
              <div className="py-8 text-center text-on-surface-variant space-y-2">
                <span className="material-symbols-outlined text-3xl text-outline">sentiment_dissatisfied</span>
                <p>Bạn chưa có voucher nào trong ví. Hãy săn thêm mã quà tặng từ cửa hàng nhé!</p>
              </div>
            )}

            {!isVouchersLoading && availableVouchers.length > 0 && (
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {availableVouchers.map((voucher) => (
                  <div
                    key={voucher.voucherId}
                    className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all ${
                      selectedVoucherCode === voucher.code
                        ? 'border-secondary bg-secondary-container/30 ring-1 ring-secondary'
                        : 'border-surface-variant hover:border-outline'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-primary text-body-md block">
                        {voucher.code}
                      </span>
                      <span className="text-caption font-semibold text-secondary block mt-0.5">
                        Giảm giá {voucher.discountPercent}% cho toàn đơn hàng
                      </span>
                      {voucher.expiredAt && (
                        <span className="text-caption text-on-surface-variant block mt-0.5">
                          HSD: {new Date(voucher.expiredAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSelectVoucher(voucher)}
                      className="px-3.5 py-1.5 bg-secondary text-white font-bold rounded-lg text-xs hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Dùng ngay
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

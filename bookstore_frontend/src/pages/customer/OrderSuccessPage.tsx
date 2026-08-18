import React, { useEffect } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../../utils';
import type { CheckoutResponse } from '../../types/api/bill';
import { apiClient } from '../../lib/apiClient';
import { CART_QUERY_KEY } from '../../features/cart/hooks/useCartQueries';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Check if returned from VNPay redirect
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTxnRef = searchParams.get('vnp_TxnRef');
  const vnpAmount = searchParams.get('vnp_Amount');
  const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
  const vnpBankCode = searchParams.get('vnp_BankCode');

  const isVnPayReturn = Boolean(vnpResponseCode);
  const isVnPaySuccess = vnpResponseCode === '00';

  useEffect(() => {
    if (isVnPayReturn) {
      const params = Object.fromEntries(searchParams.entries());
      apiClient.get('/api/payments/vnpay/return', { params })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: ['my-orders'] });
          queryClient.invalidateQueries({ queryKey: ['staff-orders'] });
        })
        .catch((err) => {
          console.error('Lỗi xác thực thanh toán VNPAY:', err);
        });
    }
  }, [isVnPayReturn, searchParams, queryClient]);

  const checkoutData = (location.state as { checkoutData?: CheckoutResponse })?.checkoutData;
  const bill = checkoutData?.bill;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="max-w-xl mx-auto bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 shadow-sm text-center space-y-6">
        {isVnPayReturn && !isVnPaySuccess ? (
          <>
            <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-5xl">cancel</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-headline-md text-headline-md text-error font-bold">
                Thanh toán không thành công
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Giao dịch qua VNPay đã bị hủy hoặc không thành công (Mã lỗi: {vnpResponseCode}).
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-secondary-container text-secondary rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-headline-md text-headline-md text-primary font-bold">
                {isVnPayReturn ? 'Thanh toán VNPay thành công!' : 'Đặt hàng thành công!'}
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Cảm ơn bạn đã mua hàng tại BookStore. Đơn hàng của bạn đang được hệ thống xử lý.
              </p>
            </div>
          </>
        )}

        {/* VNPay Return details */}
        {isVnPayReturn && (
          <div className="bg-surface p-4 rounded-xl border border-surface-variant text-left space-y-2 text-sm">
            {vnpTxnRef && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mã giao dịch / Đơn hàng:</span>
                <strong className="font-mono text-primary">{vnpTxnRef}</strong>
              </div>
            )}
            {vnpTransactionNo && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Mã giao dịch VNPay:</span>
                <span className="font-mono text-on-surface">{vnpTransactionNo}</span>
              </div>
            )}
            {vnpBankCode && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Ngân hàng:</span>
                <span className="font-semibold text-on-surface">{vnpBankCode}</span>
              </div>
            )}
            {vnpAmount && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Số tiền:</span>
                <strong className="text-primary font-bold">
                  {formatCurrency(Number(vnpAmount) / 100)}
                </strong>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Trạng thái:</span>
              <span
                className={`px-2 py-0.5 rounded font-semibold text-xs uppercase ${
                  isVnPaySuccess
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-error/10 text-error'
                }`}
              >
                {isVnPaySuccess ? 'THÀNH CÔNG' : 'THẤT BÀI / ĐÃ HỦY'}
              </span>
            </div>
          </div>
        )}

        {/* Regular bill details */}
        {!isVnPayReturn && bill && (
          <div className="bg-surface p-4 rounded-xl border border-surface-variant text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Mã đơn hàng:</span>
              <strong className="font-mono text-primary">#{bill.billId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Tổng tiền:</span>
              <strong className="text-primary font-bold">{formatCurrency(Number(bill.totalAmount))}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Trạng thái đơn:</span>
              <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded font-semibold text-xs uppercase">
                {bill.status || 'PENDING'}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/books"
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-colors cursor-pointer text-sm"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            to="/my-orders"
            className="px-6 py-3 bg-surface border border-surface-variant text-on-surface font-bold rounded-xl hover:bg-surface-variant transition-colors cursor-pointer text-sm"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

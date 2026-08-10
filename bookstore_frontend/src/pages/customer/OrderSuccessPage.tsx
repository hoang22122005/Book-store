import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import type { CheckoutResponse } from '../../types/api/bill';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const checkoutData = (location.state as { checkoutData?: CheckoutResponse })?.checkoutData;
  const bill = checkoutData?.bill;

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="max-w-xl mx-auto bg-surface-container-lowest border border-surface-variant rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="w-20 h-20 bg-secondary-container text-secondary rounded-full flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Đặt hàng thành công!
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Cảm ơn bạn đã mua hàng tại BookStore. Đơn hàng của bạn đang được hệ thống xử lý.
          </p>
        </div>

        {bill && (
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
            to="/admin/orders"
            className="px-6 py-3 bg-surface border border-surface-variant text-on-surface font-bold rounded-xl hover:bg-surface-variant transition-colors cursor-pointer text-sm"
          >
            Xem danh sách đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

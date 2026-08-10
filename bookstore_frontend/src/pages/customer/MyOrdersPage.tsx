import React, { useState } from 'react';
import { useMyOrdersQuery } from '../../features/orders';
import { formatCurrency, formatDate } from '../../utils';
import type { BillResponse } from '../../types/api/bill';

type FilterTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

const statusStepsMap: Record<string, number> = {
  PENDING: 1,
  CONFIRMED: 2,
  SHIPPING: 3,
  COMPLETED: 4,
};

const statusLabelMap: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  SHIPPING: { label: 'Đang giao hàng', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-500/10' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-500/10' },
};

export const MyOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [page, setPage] = useState<number>(0);

  const { data, isLoading, isError, error, refetch, isFetching } = useMyOrdersQuery(page, 10);

  const allOrders = data?.content || [];
  const filteredOrders = allOrders.filter((order) => {
    if (activeTab === 'ALL') return true;
    return order.status === activeTab;
  });

  const getStepProgress = (status: string | null) => {
    if (!status || status === 'CANCELLED') return 0;
    return statusStepsMap[status] || 1;
  };

  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-md">
      {/* Page Title & Breadcrumb */}
      <div className="mb-stack-md">
        <h1 className="font-headline-md text-headline-md text-primary font-bold">
          Theo dõi đơn hàng của tôi
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Theo dõi hành trình xử lý, đóng gói và vận chuyển các đơn hàng của bạn.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-stack-md border-b border-surface-variant no-scrollbar">
        {[
          { key: 'ALL', label: 'Tất cả đơn' },
          { key: 'PENDING', label: 'Chờ xử lý' },
          { key: 'CONFIRMED', label: 'Đã xác nhận' },
          { key: 'SHIPPING', label: 'Đang giao hàng' },
          { key: 'COMPLETED', label: 'Hoàn thành' },
          { key: 'CANCELLED', label: 'Đã hủy' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as FilterTab)}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary text-white font-bold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-surface-container-lowest rounded-2xl border border-surface-variant animate-pulse space-y-4">
              <div className="h-6 bg-surface-variant rounded w-1/3"></div>
              <div className="h-16 bg-surface-variant rounded w-full"></div>
              <div className="h-12 bg-surface-variant rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-error-container text-on-error-container rounded-2xl border border-error/20 flex flex-col items-center text-center space-y-3">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="font-bold text-body-md">
            {(error as Error)?.message || 'Không thể lấy dữ liệu đơn hàng từ hệ thống.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-error text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredOrders.length === 0 && (
        <div className="py-16 text-center space-y-4 bg-surface-container-lowest rounded-2xl border border-surface-variant my-4">
          <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto text-outline">
            <span className="material-symbols-outlined text-3xl">local_shipping</span>
          </div>
          <h3 className="font-bold text-headline-sm text-on-surface">Không có đơn hàng nào</h3>
          <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
            {activeTab === 'ALL'
              ? 'Bạn chưa đặt mua đơn hàng nào tại cửa hàng.'
              : `Không tìm thấy đơn hàng nào ở trạng thái này.`}
          </p>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !isError && filteredOrders.length > 0 && (
        <div className="space-y-6">
          {filteredOrders.map((order: BillResponse) => {
            const currentStep = getStepProgress(order.status);
            const statusInfo = statusLabelMap[order.status || 'PENDING'] || {
              label: order.status || 'N/A',
              color: 'text-on-surface-variant',
              bg: 'bg-surface-variant',
            };
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div
                key={order.billId}
                className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 md:p-6 shadow-xs hover:shadow-md transition-shadow space-y-5"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-variant">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-primary text-body-lg">
                      #{order.billId}
                    </span>
                    <span className="text-caption text-on-surface-variant">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusInfo.bg} ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper Timeline */}
                {!isCancelled ? (
                  <div className="py-2 px-2 md:px-4 bg-surface rounded-xl border border-surface-variant">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting progress line */}
                      <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-surface-variant z-0">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{
                            width: `${((currentStep - 1) / 3) * 100}%`,
                          }}
                        ></div>
                      </div>

                      {/* Step 1 */}
                      <div className="relative z-10 flex flex-col items-center text-center group">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            currentStep >= 1
                              ? 'bg-primary text-white ring-4 ring-primary/20'
                              : 'bg-surface-variant text-outline'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">receipt</span>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStep >= 1 ? 'text-primary font-bold' : 'text-on-surface-variant'
                          }`}
                        >
                          Đã đặt đơn
                        </span>
                      </div>

                      {/* Step 2 */}
                      <div className="relative z-10 flex flex-col items-center text-center group">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            currentStep >= 2
                              ? 'bg-primary text-white ring-4 ring-primary/20'
                              : 'bg-surface-variant text-outline'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStep >= 2 ? 'text-primary font-bold' : 'text-on-surface-variant'
                          }`}
                        >
                          Đã xác nhận
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="relative z-10 flex flex-col items-center text-center group">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            currentStep >= 3
                              ? 'bg-primary text-white ring-4 ring-primary/20'
                              : 'bg-surface-variant text-outline'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStep >= 3 ? 'text-primary font-bold' : 'text-on-surface-variant'
                          }`}
                        >
                          Đang giao hàng
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className="relative z-10 flex flex-col items-center text-center group">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            currentStep >= 4
                              ? 'bg-green-600 text-white ring-4 ring-green-600/20'
                              : 'bg-surface-variant text-outline'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            currentStep >= 4 ? 'text-green-600 font-bold' : 'text-on-surface-variant'
                          }`}
                        >
                          Giao thành công
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-error-container/60 text-on-error-container rounded-xl flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-error">cancel</span>
                    <span>Đơn hàng này đã bị hủy hoặc thanh toán không thành công.</span>
                  </div>
                )}

                {/* Items List */}
                <div className="divide-y divide-surface-variant">
                  {order.details && order.details.map((detail) => (
                    <div key={detail.billDetailId} className="py-3 flex items-center gap-4">
                      <div className="w-14 h-18 bg-surface-variant rounded-lg overflow-hidden flex-shrink-0 border border-surface-variant">
                        {detail.urlImg ? (
                          <img src={detail.urlImg} alt={detail.bookName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-outline">
                            <span className="material-symbols-outlined text-xl">book</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-on-surface text-body-md line-clamp-1">
                          {detail.bookName}
                        </h4>
                        <p className="text-caption text-on-surface-variant">
                          Số lượng: <strong className="text-on-surface">x{detail.quantity}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary text-body-md">
                          {formatCurrency(Number(detail.subTotal))}
                        </span>
                        <span className="block text-caption text-on-surface-variant">
                          {formatCurrency(Number(detail.priceAtPurchase))}/cuốn
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Total Summary */}
                <div className="pt-4 border-t border-surface-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {order.voucherCode && (
                      <span className="text-caption text-secondary font-medium block">
                        Voucher áp dụng: <strong>{order.voucherCode}</strong> (-{formatCurrency(Number(order.discountAmount))})
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 text-right">
                    <span className="text-body-md text-on-surface-variant font-medium">Tổng tiền trả:</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">
                      {formatCurrency(Number(order.totalAmount))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-stack-lg">
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0 || isFetching}
            className="px-4 py-2 bg-surface border border-surface-variant rounded-xl text-sm font-medium hover:bg-surface-variant disabled:opacity-40 transition-colors cursor-pointer"
          >
            Trang trước
          </button>
          <span className="text-sm text-on-surface-variant font-medium">
            Trang {page + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(data.totalPages - 1, prev + 1))}
            disabled={page >= data.totalPages - 1 || isFetching}
            className="px-4 py-2 bg-surface border border-surface-variant rounded-xl text-sm font-medium hover:bg-surface-variant disabled:opacity-40 transition-colors cursor-pointer"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;

import React, { useMemo, useState } from 'react';
import {
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { useAdvanceDirectOrder, useDirectStaffOrders } from '../../features/staffOrders';
import type { BillResponse } from '../../types/api/bill';
import { formatCurrency, getErrorMessage } from '../../utils';

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

const PAGE_SIZE = 10;

const statusMeta: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'border-amber-400/20 bg-amber-400/10 text-amber-300' },
  CONFIRMED: { label: 'Đã duyệt', className: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300' },
  SHIPPING: { label: 'Đang giao', className: 'border-blue-400/20 bg-blue-400/10 text-blue-300' },
  COMPLETED: { label: 'Hoàn tất', className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' },
  CANCELLED: { label: 'Đã hủy', className: 'border-rose-400/20 bg-rose-400/10 text-rose-300' },
};

type NextStatus = 'CONFIRMED' | 'SHIPPING' | 'COMPLETED';

const nextStatusByCurrent: Partial<Record<string, NextStatus>> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPING',
  SHIPPING: 'COMPLETED',
};

const transitionMeta: Record<NextStatus, { action: string; success: string }> = {
  CONFIRMED: { action: 'Duyệt đơn', success: 'đã được duyệt' },
  SHIPPING: { action: 'Bắt đầu giao', success: 'đã chuyển sang đang giao' },
  COMPLETED: { action: 'Hoàn thành', success: 'đã được hoàn thành' },
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const StaffOrderManagementPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [expandedBillId, setExpandedBillId] = useState<number | null>(null);
  const [confirmingBillId, setConfirmingBillId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const ordersQuery = useDirectStaffOrders(page, PAGE_SIZE);
  const advanceMutation = useAdvanceDirectOrder();

  const orders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (ordersQuery.data?.content ?? []).filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesSearch =
        !keyword ||
        String(order.billId).includes(keyword) ||
        order.userEmail.toLowerCase().includes(keyword);
      return matchesStatus && matchesSearch;
    });
  }, [ordersQuery.data?.content, search, statusFilter]);

  const pendingCount = (ordersQuery.data?.content ?? []).filter(
    (order) => order.status === 'PENDING',
  ).length;

  const advanceOrder = (order: BillResponse, nextStatus: NextStatus) => {
    setSuccessMessage('');
    advanceMutation.mutate({ billId: order.billId, status: nextStatus }, {
      onSuccess: () => {
        setConfirmingBillId(null);
        setSuccessMessage(`Đơn #${order.billId} ${transitionMeta[nextStatus].success}.`);
      },
    });
  };

  const totalPages = ordersQuery.data?.totalPages ?? 0;
  const totalElements = ordersQuery.data?.totalElements ?? 0;
  const startItem = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-amber-400/15 bg-slate-950 px-6 py-7 shadow-[0_24px_80px_rgba(2,6,23,0.35)] sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
              <ShieldCheck size={13} /> Khu vực STAFF
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Duyệt đơn thanh toán trực tiếp</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Kiểm tra đơn COD/DIRECT đang chờ xử lý. Khi duyệt, hệ thống chuyển đơn sang đã xác nhận và trừ phần tồn kho đã giữ.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[310px]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs text-slate-500">Tổng đơn trực tiếp</p>
              <p className="mt-1 text-2xl font-bold text-white">{totalElements.toLocaleString('vi-VN')}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <p className="text-xs text-amber-200/70">Chờ duyệt trang này</p>
              <p className="mt-1 text-2xl font-bold text-amber-300">{pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      {successMessage && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          <span className="flex items-center gap-2"><CheckCircle2 size={17} /> {successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage('')} className="rounded-lg p-1 hover:bg-emerald-400/10" aria-label="Đóng thông báo">
            <X size={16} />
          </button>
        </div>
      )}

      {advanceMutation.isError && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {getErrorMessage(advanceMutation.error, 'Không thể cập nhật trạng thái đơn hàng')}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo mã đơn hoặc email..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-amber-400/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  statusFilter === status
                    ? 'bg-amber-400 text-slate-950'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : statusMeta[status]?.label ?? status}
              </button>
            ))}
            <button
              type="button"
              onClick={() => ordersQuery.refetch()}
              disabled={ordersQuery.isFetching}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition hover:text-amber-300 disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={16} className={ordersQuery.isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {ordersQuery.isLoading && (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-900" />)}
          </div>
        )}

        {ordersQuery.isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <PackageOpen size={42} className="text-rose-400" />
            <p className="font-semibold text-white">Không tải được danh sách đơn hàng</p>
            <p className="text-sm text-slate-500">{getErrorMessage(ordersQuery.error)}</p>
            <button type="button" onClick={() => ordersQuery.refetch()} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950">Thử lại</button>
          </div>
        )}

        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <ClipboardCheck size={44} className="text-slate-600" />
            <p className="font-semibold text-white">Không có đơn phù hợp</p>
            <p className="text-sm text-slate-500">Hãy đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}

        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Đơn hàng</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Thanh toán</th>
                  <th className="px-5 py-4">Giá trị</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedBillId === order.billId;
                  const isConfirming = confirmingBillId === order.billId;
                  const hasInvalidDetails = order.details.length === 0 || order.details.some((detail) => detail.bookId === null);
                  const nextStatus = order.status ? nextStatusByCurrent[order.status] : undefined;
                  const meta = statusMeta[order.status ?? 'PENDING'] ?? statusMeta.PENDING;
                  return (
                    <React.Fragment key={order.billId}>
                      <tr className="border-t border-slate-800/80 transition hover:bg-slate-900/50">
                        <td className="px-5 py-4">
                          <p className="font-mono font-bold text-amber-300">#{order.billId}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-200">{order.userEmail}</p>
                          <p className="mt-1 text-xs text-slate-500">User #{order.userId}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-300">
                            <Banknote size={14} className="text-emerald-400" /> DIRECT / COD
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">{formatCurrency(Number(order.totalAmount))}</p>
                          <p className="mt-1 text-xs text-slate-500">{order.details.length} sản phẩm</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedBillId(isExpanded ? null : order.billId)}
                              className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                              title="Xem chi tiết"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {nextStatus && hasInvalidDetails && (
                              <span
                                className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300"
                                title="Đơn hàng không có đủ liên kết sản phẩm để trừ kho"
                              >
                                Thiếu dữ liệu
                              </span>
                            )}
                            {nextStatus && !hasInvalidDetails && !isConfirming && (
                              <button
                                type="button"
                                onClick={() => {
                                  advanceMutation.reset();
                                  setConfirmingBillId(order.billId);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
                              >
                                {nextStatus === 'CONFIRMED' && <ClipboardCheck size={15} />}
                                {nextStatus === 'SHIPPING' && <Truck size={15} />}
                                {nextStatus === 'COMPLETED' && <PackageCheck size={15} />}
                                {transitionMeta[nextStatus].action}
                              </button>
                            )}
                            {isConfirming && nextStatus && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => advanceOrder(order, nextStatus)}
                                  disabled={advanceMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                                >
                                  <Check size={15} /> {advanceMutation.isPending ? 'Đang cập nhật...' : `Xác nhận ${transitionMeta[nextStatus].action.toLowerCase()}`}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmingBillId(null)}
                                  disabled={advanceMutation.isPending}
                                  className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:text-white disabled:opacity-50"
                                >
                                  <X size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-t border-slate-800 bg-slate-900/60">
                          <td colSpan={6} className="px-5 py-5">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {order.details.map((detail) => (
                                <div key={detail.billDetailId} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
                                  {detail.urlImg ? (
                                    <img src={detail.urlImg} alt={detail.bookName} className="h-16 w-12 rounded-lg object-cover" />
                                  ) : (
                                    <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-slate-800"><PackageOpen size={18} className="text-slate-500" /></div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-slate-200">{detail.bookName}</p>
                                    <p className="mt-1 text-xs text-slate-500">{detail.quantity} × {formatCurrency(Number(detail.priceAtPurchase))}</p>
                                    <p className="mt-1 text-sm font-semibold text-amber-300">{formatCurrency(Number(detail.subTotal))}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {ordersQuery.data && totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Hiển thị {startItem}–{endItem} trong {totalElements} đơn trực tiếp</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0 || ordersQuery.isFetching} className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-xs font-semibold text-slate-300">Trang {page + 1} / {totalPages}</span>
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={page >= totalPages - 1 || ordersQuery.isFetching} className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-white disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StaffOrderManagementPage;

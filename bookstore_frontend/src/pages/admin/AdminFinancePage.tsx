import React, { useMemo, useState } from 'react';
import {
  BadgePercent,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import {
  DailyRevenueTable,
  MetricCard,
  PaymentMethodBarChart,
  PaymentPieChart,
  RevenueChart,
} from '../../features/dashboard/components';
import {
  useFinancialOverview,
  usePaymentMethodStats,
  useRevenueChart,
} from '../../features/dashboard/hooks';
import { formatCurrency } from '../../utils';

type DateRange = { from: string; to: string };

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createPresetRange = (days: number): DateRange => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toDateInput(from), to: toDateInput(to) };
};

const getRangeError = ({ from, to }: DateRange) => {
  if (!from || !to) return 'Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.';
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  if (fromDate > toDate) return 'Ngày bắt đầu không được sau ngày kết thúc.';
  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
  if (diffDays > 366) return 'Khoảng báo cáo không được vượt quá 366 ngày.';
  return '';
};

const formatRangeLabel = ({ from, to }: DateRange) => {
  const formatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${formatter.format(new Date(`${from}T00:00:00`))} — ${formatter.format(new Date(`${to}T00:00:00`))}`;
};

export const AdminFinancePage: React.FC = () => {
  const [presetDays, setPresetDays] = useState<number | null>(30);
  const [dateRange, setDateRange] = useState<DateRange>(() => createPresetRange(30));
  const rangeError = useMemo(() => getRangeError(dateRange), [dateRange]);
  const canLoad = !rangeError;

  const revenue = useRevenueChart(dateRange.from, dateRange.to, canLoad);
  const payments = usePaymentMethodStats(dateRange.from, dateRange.to, canLoad);
  const overview = useFinancialOverview(dateRange.from, dateRange.to, canLoad);

  const handlePresetChange = (days: number) => {
    setPresetDays(days);
    setDateRange(createPresetRange(days));
  };

  const handleCustomDateChange = (type: keyof DateRange, value: string) => {
    setPresetDays(null);
    setDateRange((current) => ({ ...current, [type]: value }));
  };

  const cancelledRate = overview.data?.totalOrders
    ? (overview.data.cancelledOrders / overview.data.totalOrders) * 100
    : 0;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/15 bg-slate-950 px-6 py-7 shadow-[0_24px_80px_rgba(2,6,23,0.35)] sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-7">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                <Banknote size={13} /> Báo cáo tài chính
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Doanh thu & dòng tiền</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Phân tích doanh thu thực nhận từ đơn hoàn tất, mức giảm voucher và hành vi thanh toán theo kỳ.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw size={13} /> Dữ liệu tự làm mới mỗi 5 phút
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {[7, 30, 90, 365].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handlePresetChange(days)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    presetDays === days
                      ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/30'
                      : 'border border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {days === 365 ? '1 năm' : `${days} ngày`}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <CalendarDays size={17} className="hidden text-emerald-300 sm:block" />
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-500">
                Từ
                <input
                  type="date"
                  value={dateRange.from}
                  max={dateRange.to}
                  onChange={(event) => handleCustomDateChange('from', event.target.value)}
                  className="bg-transparent font-semibold text-slate-200 outline-none [color-scheme:dark]"
                />
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-500">
                Đến
                <input
                  type="date"
                  value={dateRange.to}
                  min={dateRange.from}
                  max={toDateInput(new Date())}
                  onChange={(event) => handleCustomDateChange('to', event.target.value)}
                  className="bg-transparent font-semibold text-slate-200 outline-none [color-scheme:dark]"
                />
              </label>
            </div>
          </div>
          {rangeError ? (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-xs font-medium text-rose-300">
              {rangeError}
            </p>
          ) : (
            <p className="text-xs text-slate-500">Đang xem dữ liệu từ {formatRangeLabel(dateRange)}</p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Tổng quan kỳ</p>
            <h2 className="mt-1 text-xl font-bold text-white">Các chỉ số tài chính chính</h2>
          </div>
          <span className="hidden text-xs text-slate-500 sm:block">Chỉ tính đơn đã hoàn tất</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard
            label="Doanh thu thuần"
            value={formatCurrency(Number(overview.data?.revenue ?? 0))}
            helper="Thực nhận sau voucher"
            icon={CircleDollarSign}
            tone="emerald"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Đơn hoàn tất"
            value={(overview.data?.completedOrders ?? 0).toLocaleString('vi-VN')}
            helper={`${overview.data?.completionRatePercent ?? 0}% tổng đơn`}
            icon={CheckCircle2}
            tone="blue"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Giá trị đơn TB"
            value={formatCurrency(Number(overview.data?.averageOrderValue ?? 0))}
            helper="Trên mỗi đơn hoàn tất"
            icon={ReceiptText}
            tone="amber"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Sách đã bán"
            value={(overview.data?.itemsSold ?? 0).toLocaleString('vi-VN')}
            helper="Số lượng sản phẩm"
            icon={PackageCheck}
            tone="cyan"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Giảm bằng voucher"
            value={formatCurrency(Number(overview.data?.voucherDiscount ?? 0))}
            helper="Chênh lệch trước giảm giá"
            icon={BadgePercent}
            tone="violet"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Đơn đã hủy"
            value={(overview.data?.cancelledOrders ?? 0).toLocaleString('vi-VN')}
            helper={`${cancelledRate.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}% tổng đơn`}
            icon={ShoppingBag}
            tone="rose"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
        </div>
      </section>

      <RevenueChart data={revenue.data} isLoading={revenue.isLoading} isError={revenue.isError || !!rangeError} />

      <section>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Thanh toán</p>
          <h2 className="mt-1 text-xl font-bold text-white">Cơ cấu nguồn thu</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <PaymentPieChart data={payments.data} isLoading={payments.isLoading} isError={payments.isError || !!rangeError} />
          <PaymentMethodBarChart data={payments.data} isLoading={payments.isLoading} isError={payments.isError || !!rangeError} />
        </div>
      </section>

      <DailyRevenueTable data={revenue.data} isLoading={revenue.isLoading} isError={revenue.isError || !!rangeError} />
    </div>
  );
};

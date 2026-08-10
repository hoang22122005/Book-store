import React from 'react';
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  MetricCard,
  OrderStatusPieChart,
  RevenueChart,
  TopBooksList,
  TopCustomersList,
} from '../../features/dashboard/components';
import {
  useFinancialOverview,
  useOrderSummary,
  useRevenueChart,
  useTopBooks,
  useTopCustomers,
} from '../../features/dashboard/hooks';
import { formatCurrency } from '../../utils';
import type { DateOnly } from '../../types/api/common';

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` as DateOnly;
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );

export const AdminDashboardPage: React.FC = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);

  const fromStr = toDateOnly(from);
  const toStr = toDateOnly(to);

  const summary = useOrderSummary();
  const overview = useFinancialOverview(fromStr, toStr);
  const revenue = useRevenueChart(fromStr, toStr);
  const books = useTopBooks(5);
  const customers = useTopCustomers(fromStr, toStr, 5);

  const totalOrders = summary.data?.totalOrders ?? 0;
  const pendingOrders = summary.data?.ordersByStatus?.PENDING ?? 0;
  const activeOrders =
    pendingOrders +
    (summary.data?.ordersByStatus?.CONFIRMED ?? 0) +
    (summary.data?.ordersByStatus?.SHIPPING ?? 0);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-amber-400/15 bg-slate-950 px-6 py-7 shadow-[0_24px_80px_rgba(2,6,23,0.35)] sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">
              <Sparkles size={13} /> Trung tâm điều hành
            </div>
            <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bức tranh kinh doanh, <span className="text-amber-300">trong một màn hình.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Theo dõi sức khỏe đơn hàng toàn hệ thống và hiệu suất bán hàng trong 30 ngày gần nhất.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Kỳ báo cáo</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-200">
                {formatShortDate(fromStr)} — {formatShortDate(toStr)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">30 ngày gần nhất</p>
            <h2 className="mt-1 text-xl font-bold text-white">Hiệu suất kinh doanh</h2>
          </div>
          <span className="hidden text-xs text-slate-500 sm:block">Nguồn: API financial-overview</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Doanh thu thuần"
            value={formatCurrency(Number(overview.data?.revenue ?? 0))}
            helper="Doanh thu từ đơn hoàn tất trong kỳ"
            icon={CircleDollarSign}
            tone="amber"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Đơn hoàn tất"
            value={(overview.data?.completedOrders ?? 0).toLocaleString('vi-VN')}
            helper={`${overview.data?.completionRatePercent ?? 0}% trên tổng đơn trong kỳ`}
            icon={CheckCircle2}
            tone="emerald"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Sản phẩm đã bán"
            value={(overview.data?.itemsSold ?? 0).toLocaleString('vi-VN')}
            helper="Tổng số lượng sách thuộc đơn hoàn tất"
            icon={BookOpenCheck}
            tone="blue"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
          <MetricCard
            label="Giá trị trung bình"
            value={formatCurrency(Number(overview.data?.averageOrderValue ?? 0))}
            helper="Giá trị trung bình mỗi đơn hoàn tất"
            icon={ArrowUpRight}
            tone="violet"
            isLoading={overview.isLoading}
            isError={overview.isError}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <RevenueChart data={revenue.data} isLoading={revenue.isLoading} isError={revenue.isError} />
        <OrderStatusPieChart data={summary.data} isLoading={summary.isLoading} isError={summary.isError} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-blue-300" size={20} />
            <p className="text-sm font-semibold text-slate-300">Tổng đơn toàn hệ thống</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{summary.isLoading ? '—' : totalOrders.toLocaleString('vi-VN')}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex items-center gap-3">
            <PackageCheck className="text-amber-300" size={20} />
            <p className="text-sm font-semibold text-slate-300">Đơn đang vận hành</p>
          </div>
          <p className="mt-4 text-3xl font-bold text-white">{summary.isLoading ? '—' : activeOrders.toLocaleString('vi-VN')}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="text-emerald-300" size={20} />
            <p className="text-sm font-semibold text-slate-300">Doanh thu tích lũy</p>
          </div>
          <p className="mt-4 truncate text-2xl font-bold text-white">
            {summary.isLoading ? '—' : formatCurrency(Number(summary.data?.totalRevenue ?? 0))}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">Xếp hạng</p>
          <h2 className="mt-1 text-xl font-bold text-white">Điểm sáng bán hàng</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <TopBooksList data={books.data} isLoading={books.isLoading} isError={books.isError} />
          <TopCustomersList data={customers.data} isLoading={customers.isLoading} isError={customers.isError} />
        </div>
      </section>
    </div>
  );
};

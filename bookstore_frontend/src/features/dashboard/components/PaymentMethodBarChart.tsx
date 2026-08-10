import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import type { PaymentMethodStatsResponse } from '../../../types/api/dashboard';

interface PaymentMethodBarChartProps {
  data?: PaymentMethodStatsResponse[];
  isLoading: boolean;
  isError: boolean;
}

const getPaymentMethodLabel = (method: string) => {
  if (method === 'DIRECT') return 'Thanh toán khi nhận hàng';
  if (method === 'VNPAY') return 'Ví điện tử VNPAY';
  return method;
};

interface PaymentBarDatum {
  fullMethod: string;
  orderCount: number;
  revenue: number;
}

interface PaymentBarTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PaymentBarDatum }>;
}

const CustomTooltip = ({ active, payload }: PaymentBarTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="text-white font-bold mb-1">{data.fullMethod}</p>
        <p className="text-blue-400">Số đơn: <span className="font-semibold text-white">{data.orderCount} đơn</span></p>
        <p className="text-emerald-400 mt-0.5">Doanh thu: <span className="font-bold">{formatCurrency(data.revenue)}</span></p>
      </div>
    );
  }
  return null;
};

export const PaymentMethodBarChart: React.FC<PaymentMethodBarChartProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-[320px] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full px-4">
          <div className="h-40 bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-[320px] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Không có dữ liệu phương thức thanh toán.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    method: item.paymentMethod,
    fullMethod: getPaymentMethodLabel(item.paymentMethod),
    revenue: Number(item.revenue || 0),
    orderCount: item.orderCount,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-lg font-bold text-white">Doanh Thu Theo Phương Thức</h3>
          <p className="text-xs text-slate-400">So sánh doanh thu thực tế giữa các cổng thanh toán</p>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="method"
              stroke="#64748b"
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
              className="text-xs font-semibold"
            />
            <YAxis
              stroke="#64748b"
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
              className="text-[11px]"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={36}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

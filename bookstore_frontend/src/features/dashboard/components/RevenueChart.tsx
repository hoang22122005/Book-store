import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDate, formatCurrency } from '../../../utils';
import type { RevenuePointResponse } from '../../../types/api/dashboard';

interface RevenueChartProps {
  data?: RevenuePointResponse[];
  isLoading: boolean;
  isError: boolean;
}

interface RevenueTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: RevenueTooltipProps) => {
  if (active && payload && payload.length) {
    const value = Number(payload[0].value ?? 0);
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{formatDate(String(label ?? ''))}</p>
        <p className="text-emerald-400 font-bold text-sm">
          Doanh thu: {formatCurrency(value)}
        </p>
      </div>
    );
  }
  return null;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 w-full h-[380px] flex items-center justify-center">
        <div className="animate-pulse flex items-end space-x-4 h-52 w-full px-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="bg-slate-800 flex-1 rounded-t" style={{ height: `${(i % 5 + 1) * 18}%` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 w-full h-[380px] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Không có dữ liệu biểu đồ doanh thu.</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date,
    revenue: Number(d.revenue || 0),
  }));

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Xu Hướng Doanh Thu</h3>
          <p className="text-xs text-slate-400">Biểu đồ thể hiện biến động doanh thu theo mốc thời gian</p>
        </div>
        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-[11px] text-slate-400 block">Tổng doanh thu kỳ</span>
          <span className="text-emerald-400 font-bold text-base">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tickLine={false}
              axisLine={{ stroke: '#1e293b' }}
              tickFormatter={(val) => formatDate(val).substring(0, 5)}
              className="text-[11px]"
            />
            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${(Number(val) / 1000000).toFixed(0)}tr`}
              className="text-[11px]"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

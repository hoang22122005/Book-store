import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { OrderSummaryResponse } from '../../../types/api/dashboard';

interface OrderStatusPieChartProps {
  data?: OrderSummaryResponse;
  isLoading: boolean;
  isError: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Giao thành công', color: '#10b981' },
  PENDING: { label: 'Đang xử lý', color: '#f59e0b' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444' },
  SHIPPING: { label: 'Đang giao hàng', color: '#3b82f6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#8b5cf6' },
};

interface OrderStatusTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
}

const CustomTooltip = ({ active, payload }: OrderStatusTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="text-white font-bold mb-1">{data.name ?? 'Trạng thái'}</p>
        <p className="text-slate-300">
          Số đơn: <span className="font-bold text-white">{data.value} đơn</span>
        </p>
      </div>
    );
  }
  return null;
};

export const OrderStatusPieChart: React.FC<OrderStatusPieChartProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-36 h-36 rounded-full border-[10px] border-slate-800 border-t-emerald-500 animate-spin mb-4"></div>
      </div>
    );
  }

  if (isError || !data || !data.ordersByStatus) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-full flex items-center justify-center min-h-[300px]">
        <p className="text-slate-400 text-sm">Không có dữ liệu trạng thái đơn hàng.</p>
      </div>
    );
  }

  const chartData = Object.entries(data.ordersByStatus).map(([status, count]) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: '#64748b' };
    return {
      name: cfg.label,
      value: count,
      color: cfg.color,
    };
  });

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Trạng Thái Đơn Hàng</h3>
        <p className="text-xs text-slate-400 mb-4">Tỷ lệ các trạng thái xử lý đơn hàng</p>
      </div>

      <div className="h-[240px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#020617" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-slate-300 text-xs font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-xl font-bold text-white">{data.totalOrders}</span>
          <span className="text-[10px] text-slate-400">Tổng đơn</span>
        </div>
      </div>
    </div>
  );
};

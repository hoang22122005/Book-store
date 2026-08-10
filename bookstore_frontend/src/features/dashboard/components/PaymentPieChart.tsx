import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PaymentMethodStatsResponse } from '../../../types/api/dashboard';

interface PaymentPieChartProps {
  data?: PaymentMethodStatsResponse[];
  isLoading: boolean;
  isError: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const getPaymentMethodLabel = (method: string) => {
  if (method === 'DIRECT') return 'Thanh toán khi nhận hàng';
  if (method === 'VNPAY') return 'Ví điện tử VNPAY';
  return method;
};

interface PaymentPieTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
}

const CustomTooltip = ({ active, payload }: PaymentPieTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="text-white font-bold mb-1">{data.name ?? 'Thanh toán'}</p>
        <p className="text-blue-400">Số đơn: <span className="font-semibold text-white">{data.value} đơn</span></p>
      </div>
    );
  }
  return null;
};

export const PaymentPieChart: React.FC<PaymentPieChartProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-40 h-40 rounded-full border-[12px] border-slate-800 border-t-blue-500 animate-spin mb-4"></div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-full flex items-center justify-center min-h-[300px]">
        <p className="text-slate-400 text-sm">Không có dữ liệu phương thức thanh toán.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: getPaymentMethodLabel(item.paymentMethod),
    value: item.orderCount,
  }));

  const totalOrders = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Tỷ Lệ Thanh Toán</h3>
        <p className="text-xs text-slate-400 mb-4">Phân bổ theo số lượng đơn đặt hàng</p>
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
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#020617" strokeWidth={2} />
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
          <span className="text-xl font-bold text-white">{totalOrders}</span>
          <span className="text-[10px] text-slate-400">Đơn hàng</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
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
import { Trophy } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import type { TopBookResponse } from '../../../types/api/dashboard';

interface TopBooksListProps {
  data?: TopBookResponse[];
  isLoading: boolean;
  isError: boolean;
}

interface TopBookChartDatum {
  fullTitle: string;
  quantitySold: number;
  revenue: number;
}

interface TopBookTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TopBookChartDatum }>;
}

const CustomTooltip = ({ active, payload }: TopBookTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs max-w-xs">
        <p className="text-white font-bold mb-1 line-clamp-1">{data.fullTitle}</p>
        <p className="text-blue-400">Đã bán: <span className="font-bold text-white">{data.quantitySold} cuốn</span></p>
        <p className="text-emerald-400 mt-0.5">Doanh thu: <span className="font-bold">{formatCurrency(Number(data.revenue))}</span></p>
      </div>
    );
  }
  return null;
};

export const TopBooksList: React.FC<TopBooksListProps> = ({ data, isLoading, isError }) => {
  const [metric, setMetric] = useState<'quantity' | 'revenue'>('quantity');

  if (isLoading) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-[400px] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-[400px] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Không có dữ liệu sách bán chạy.</p>
      </div>
    );
  }

  const chartData = data.map((b) => ({
    name: b.bookName.length > 22 ? b.bookName.substring(0, 20) + '...' : b.bookName,
    fullTitle: b.bookName,
    quantitySold: b.quantitySold,
    revenue: Number(b.revenue || 0),
  }));

  const BAR_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899'];

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Top Sách Bán Chạy</h3>
        </div>
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setMetric('quantity')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              metric === 'quantity' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Theo Số Lượng
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              metric === 'revenue' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Theo Doanh Thu
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              axisLine={{ stroke: '#1e293b' }}
              tickLine={false}
              tickFormatter={(val) =>
                metric === 'revenue' ? `${(val / 1000000).toFixed(0)}M` : `${val}`
              }
              className="text-[11px]"
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#cbd5e1"
              axisLine={false}
              tickLine={false}
              width={140}
              className="text-[11px] font-medium"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={metric === 'quantity' ? 'quantitySold' : 'revenue'}
              radius={[0, 8, 8, 0]}
              barSize={20}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

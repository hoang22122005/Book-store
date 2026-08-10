import React from 'react';
import { DollarSign, ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import type { OrderSummaryResponse } from '../../../types/api/dashboard';

interface SummaryCardsProps {
  data?: OrderSummaryResponse;
  isLoading: boolean;
  isError: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-pulse">
            <div className="h-4 w-24 bg-slate-800 rounded mb-4"></div>
            <div className="h-8 w-32 bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-red-950/20 border border-red-900/50 text-red-400 p-4 rounded-xl mb-8 text-center text-sm">
        Không thể tải dữ liệu tổng quan.
      </div>
    );
  }

  const totalRevenue = Number(data.totalRevenue || 0);
  const totalOrders = data.totalOrders || 0;
  const completedOrders = data.ordersByStatus?.COMPLETED || 0;
  const pendingOrders = data.ordersByStatus?.PENDING || 0;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const cards = [
    {
      title: 'Tổng Doanh Thu',
      value: formatCurrency(totalRevenue),
      subtitle: 'Doanh thu phát sinh',
      icon: DollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      badgeColor: 'bg-amber-500/20 text-amber-300',
      badgeText: 'Tích lũy',
    },
    {
      title: 'Tổng Đơn Hàng',
      value: totalOrders.toLocaleString('vi-VN'),
      subtitle: 'Tất cả đơn vị đặt hàng',
      icon: ShoppingBag,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      badgeColor: 'bg-blue-500/20 text-blue-300',
      badgeText: 'Tổng số',
    },
    {
      title: 'Đơn Thành Công',
      value: completedOrders.toLocaleString('vi-VN'),
      subtitle: `${completionRate}% Tỷ lệ giao thành công`,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      badgeText: `${completionRate}%`,
    },
    {
      title: 'Đơn Chờ Xử Lý',
      value: pendingOrders.toLocaleString('vi-VN'),
      subtitle: 'Cần tiếp nhận & xác nhận',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      badgeColor: 'bg-purple-500/20 text-purple-300',
      badgeText: 'Đang xử lý',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl border ${card.bgColor} ${card.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                {card.badgeText}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
              <p className="text-[11px] text-slate-500 mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

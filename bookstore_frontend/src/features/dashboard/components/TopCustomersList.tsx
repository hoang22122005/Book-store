import React from 'react';
import { User, Award } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import type { TopCustomerResponse } from '../../../types/api/dashboard';

interface TopCustomersListProps {
  data?: TopCustomerResponse[];
  isLoading: boolean;
  isError: boolean;
}

export const TopCustomersList: React.FC<TopCustomersListProps> = ({ data, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-full">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 h-full flex items-center justify-center min-h-[300px]">
        <p className="text-slate-400 text-sm">Không có dữ liệu khách hàng tiêu biểu.</p>
      </div>
    );
  }

  const maxSpent = Math.max(...data.map((c) => Number(c.totalSpent || 1)));

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Khách Hàng Tiêu Biểu</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">Xếp hạng theo tổng giá trị mua hàng</p>
      </div>

      <div className="space-y-3">
        {data.map((customer, index) => {
          const spent = Number(customer.totalSpent);
          const percent = Math.round((spent / maxSpent) * 100);

          return (
            <div
              key={customer.userId}
              className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0
                      ? 'bg-amber-500 text-slate-950'
                      : index === 1
                      ? 'bg-slate-300 text-slate-950'
                      : index === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-slate-100 font-semibold text-sm truncate group-hover:text-blue-400 transition-colors">
                    {customer.name}
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {customer.completedOrders} đơn hàng hoàn tất
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-amber-400 font-bold text-sm">{formatCurrency(spent)}</p>
                <div className="w-20 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden ml-auto">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

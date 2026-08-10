import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils';
import type { RevenuePointResponse } from '../../../types/api/dashboard';

interface DailyRevenueTableProps {
  data?: RevenuePointResponse[];
  isLoading: boolean;
  isError: boolean;
}

export const DailyRevenueTable: React.FC<DailyRevenueTableProps> = ({ data, isLoading, isError }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (isLoading) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-pulse mt-8">
        <div className="h-6 w-48 bg-slate-800 rounded mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center py-10 text-slate-400 text-sm mt-8">
        Chưa có dữ liệu chi tiết doanh thu theo ngày.
      </div>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const maxRevenue = Math.max(...data.map((d) => Number(d.revenue || 0)));
  const totalRevenue = data.reduce((sum, d) => sum + Number(d.revenue || 0), 0);
  const avgDailyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Chi Tiết Doanh Thu Theo Ngày</h3>
          <p className="text-xs text-slate-400">Danh sách phát sinh doanh thu từng ngày trong kỳ chọn</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            Tổng cộng: <strong className="text-emerald-400 font-bold">{formatCurrency(totalRevenue)}</strong>
          </span>
          <span className="text-slate-400">
            TB/ngày: <strong className="text-blue-400 font-bold">{formatCurrency(avgDailyRevenue)}</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="pb-3 px-3">Ngày</th>
              <th className="pb-3 px-3 text-right">Doanh thu ngày</th>
              <th className="pb-3 px-3 text-right">Cường độ phát sinh</th>
              <th className="pb-3 px-3 text-center">Đánh giá</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {paginatedData.map((item) => {
              const rev = Number(item.revenue || 0);
              const percent = maxRevenue > 0 ? Math.round((rev / maxRevenue) * 100) : 0;
              const dateObj = new Date(item.date);
              const dayOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][
                dateObj.getDay()
              ];

              const isPeak = rev === maxRevenue && rev > 0;
              const isHigh = rev >= avgDailyRevenue * 1.2 && rev > 0;

              return (
                <tr key={item.date} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-400 shrink-0" />
                      <span className="text-slate-200 font-medium">
                        {dayOfWeek}, {formatDate(item.date)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold">
                    <span className={rev > avgDailyRevenue ? 'text-emerald-400' : 'text-slate-300'}>
                      {formatCurrency(rev)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[11px] text-slate-400 font-medium w-8">{percent}%</span>
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPeak ? 'bg-amber-400' : isHigh ? 'bg-emerald-400' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isPeak ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <TrendingUp size={10} /> Peak Day
                      </span>
                    ) : isHigh ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        Cao
                      </span>
                    ) : rev === 0 ? (
                      <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">
                        Không có
                      </span>
                    ) : (
                      <span className="bg-blue-500/15 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px]">
                        Bình thường
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Trang {currentPage} / {totalPages} ({sortedData.length} ngày)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

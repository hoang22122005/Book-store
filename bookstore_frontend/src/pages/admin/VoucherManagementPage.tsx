import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CircleAlert, Plus, Tag, Users } from 'lucide-react';
import { useAdminVouchersQuery, useCreateVoucherMutation } from '../../features/vouchers';
import type { CreateVoucherRequest } from '../../types/api/voucher';

type VoucherScope = 'GLOBAL' | 'PRIVATE';

const initialForm = { code: '', discount: '', expiredAt: '', usageLimit: '', maxDiscountAmount: '', userIds: '' };
const currency = (amount: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
}).format(amount);

export const VoucherManagementPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [scope, setScope] = useState<VoucherScope>('GLOBAL');
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const { data, isLoading, isError, error, refetch } = useAdminVouchersQuery(page, 10);
  const createVoucher = useCreateVoucherMutation();
  const vouchers = data?.content ?? [];
  const setField = (field: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const discount = Number(form.discount);
    if (!form.code.trim() || !Number.isFinite(discount) || discount <= 0 || discount > 100 || !form.expiredAt) {
      setFormError('Hãy nhập mã, phần trăm giảm hợp lệ và thời gian hết hạn.');
      return;
    }
    const optionalPositive = (value: string, label: string): number | null | undefined => {
      if (!value.trim()) return null;
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setFormError(`${label} phải lớn hơn 0.`);
        return undefined;
      }
      return parsed;
    };
    const usageLimit = optionalPositive(form.usageLimit, 'Giới hạn lượt dùng');
    const maxDiscountAmount = optionalPositive(form.maxDiscountAmount, 'Mức giảm tối đa');
    if (usageLimit === undefined || maxDiscountAmount === undefined) return;

    const userIds = scope === 'PRIVATE'
      ? [...new Set(form.userIds.split(/[ ,\n]+/).filter(Boolean).map(Number))]
      : [];
    if (scope === 'PRIVATE' && (userIds.length === 0 || userIds.some((id) => !Number.isInteger(id) || id <= 0))) {
      setFormError('Voucher riêng cần ít nhất một User ID hợp lệ.');
      return;
    }
    const request: CreateVoucherRequest = {
      code: form.code.trim().toUpperCase(), discount,
      expiredAt: new Date(form.expiredAt).toISOString(), maxDiscountAmount, userIds,
      ...(scope === 'GLOBAL' ? { usageLimit } : {}),
    };
    createVoucher.mutate(request, {
      onSuccess: () => { setForm(initialForm); setScope('GLOBAL'); setPage(0); },
    });
  };

  return <div className="mx-auto w-full max-w-[1400px] space-y-6">
    <div><h1 className="text-2xl font-bold text-white">Quản lý voucher</h1><p className="mt-1 text-sm text-slate-400">Tạo voucher global hoặc cấp riêng cho khách hàng.</p></div>

    <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-amber-500/10 p-2.5"><Plus className="text-amber-400" size={20} /></div><div><h2 className="font-bold text-white">Tạo voucher mới</h2><p className="text-sm text-slate-400">Thiết lập mức giảm và giới hạn sử dụng.</p></div></div>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label><span className="mb-1.5 block text-sm font-medium text-slate-300">Mã voucher</span><input value={form.code} onChange={(e) => setField('code', e.target.value.toUpperCase())} placeholder="SUMMER20" maxLength={50} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-500 focus:outline-none" /></label>
          <label><span className="mb-1.5 block text-sm font-medium text-slate-300">Giảm giá (%)</span><input type="number" min="0.01" max="100" step="0.01" value={form.discount} onChange={(e) => setField('discount', e.target.value)} placeholder="20" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" /></label>
          <label><span className="mb-1.5 block text-sm font-medium text-slate-300">Hết hạn</span><input type="datetime-local" value={form.expiredAt} onChange={(e) => setField('expiredAt', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" /></label>
        </div>
        <div><span className="mb-2 block text-sm font-medium text-slate-300">Phạm vi voucher</span><div className="flex gap-3"><button type="button" onClick={() => setScope('GLOBAL')} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${scope === 'GLOBAL' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>Global</button><button type="button" onClick={() => setScope('PRIVATE')} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${scope === 'PRIVATE' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}>Riêng cho người dùng</button></div></div>
        <div className="grid gap-4 md:grid-cols-2">
          {scope === 'GLOBAL' ? <label><span className="mb-1.5 block text-sm font-medium text-slate-300">Giới hạn lượt dùng <em className="font-normal text-slate-500">(bỏ trống = không giới hạn)</em></span><input type="number" min="1" step="1" value={form.usageLimit} onChange={(e) => setField('usageLimit', e.target.value)} placeholder="100" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" /></label> : <label><span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-300"><Users size={15} /> User ID nhận voucher</span><input value={form.userIds} onChange={(e) => setField('userIds', e.target.value)} placeholder="12, 45, 89" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" /><small className="mt-1 block text-slate-500">Phân cách bằng dấu phẩy hoặc khoảng trắng.</small></label>}
          <label><span className="mb-1.5 block text-sm font-medium text-slate-300">Mức giảm tối đa <em className="font-normal text-slate-500">(VND, bỏ trống = không giới hạn)</em></span><input type="number" min="1000" step="1000" value={form.maxDiscountAmount} onChange={(e) => setField('maxDiscountAmount', e.target.value)} placeholder="100000" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none" /></label>
        </div>
        {(formError || createVoucher.isError) && <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"><CircleAlert size={17} />{formError || createVoucher.error?.message || 'Không thể tạo voucher.'}</div>}
        <button disabled={createVoucher.isPending} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"><Tag size={17} />{createVoucher.isPending ? 'Đang tạo...' : 'Tạo voucher'}</button>
      </form>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
      <div className="border-b border-slate-800 px-5 py-4"><h2 className="font-bold text-white">Danh sách voucher</h2><p className="text-sm text-slate-400">{data ? `${data.totalElements} voucher` : 'Đang tải...'}</p></div>
      {isLoading ? <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400"><span className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />Đang tải...</div> : isError ? <div className="py-16 text-center"><p className="text-sm text-red-400">{error.message}</p><button onClick={() => refetch()} className="mt-3 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400">Thử lại</button></div> : <><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Mã</th><th className="px-4 py-3">Phạm vi</th><th className="px-4 py-3">Giảm giá</th><th className="px-4 py-3">Lượt dùng</th><th className="px-4 py-3">Hết hạn</th></tr></thead><tbody>{vouchers.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-slate-500"><Tag className="mx-auto mb-3 text-slate-600" size={36} />Chưa có voucher nào.</td></tr> : vouchers.map((voucher) => <tr key={voucher.voucherId} className="border-b border-slate-800/60 text-slate-300 hover:bg-slate-900/50"><td className="px-5 py-4 font-mono font-semibold text-amber-300">{voucher.code}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${voucher.scope === 'GLOBAL' ? 'bg-sky-500/10 text-sky-300' : 'bg-violet-500/10 text-violet-300'}`}>{voucher.scope}</span></td><td className="px-4 py-4"><b className="text-white">{voucher.discountPercent}%</b>{voucher.maxDiscountAmount && <small className="mt-1 block text-slate-500">tối đa {currency(Number(voucher.maxDiscountAmount))}</small>}</td><td className="px-4 py-4">{voucher.scope === 'GLOBAL' ? <><b className="text-white">{voucher.usageCount ?? 0}</b><span className="text-slate-500"> / {voucher.usageLimit ?? '∞'}</span></> : <span>{voucher.assignedCount ?? 0} người nhận</span>}</td><td className="px-4 py-4 text-slate-400">{new Date(voucher.expiredAt).toLocaleString('vi-VN')}</td></tr>)}</tbody></table></div>{data && data.totalPages > 1 && <div className="flex items-center justify-between px-5 py-3"><span className="text-xs text-slate-500">Trang {data.page + 1}/{data.totalPages}</span><div className="flex gap-1"><button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={data.first} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ChevronLeft size={16} /></button><button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={data.last} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ChevronRight size={16} /></button></div></div>}</>}
    </section>
  </div>;
};

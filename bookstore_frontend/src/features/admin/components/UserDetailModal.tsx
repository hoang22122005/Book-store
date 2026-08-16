import React from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  CheckCircle2,
  Lock,
  Crown,
  KeyRound,
  Edit3,
} from 'lucide-react';
import type { AdminUserResponse } from '../../../types/api/user';
import type { UserRole } from '../../../types/api/auth';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserResponse | null;
  onOpenEdit: (user: AdminUserResponse) => void;
  onOpenResetPassword: (user: AdminUserResponse) => void;
}

const roleBadgeColor: Record<UserRole, { bg: string; text: string; label: string }> = {
  ADMIN: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', label: 'Quản trị viên (ADMIN)' },
  STAFF: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Nhân viên (STAFF)' },
  ACCOUNTANT: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Kế toán (ACCOUNTANT)' },
  WAREHOUSE_KEEPER: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', label: 'Thủ kho (WAREHOUSE_KEEPER)' },
  USER: { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-300', label: 'Khách hàng (USER)' },
  CLONE: { bg: 'bg-slate-700/10 border-slate-700/30', text: 'text-slate-500', label: 'Clone' },
};

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenEdit,
  onOpenResetPassword,
}) => {
  if (!isOpen || !user) return null;

  const roleMeta = roleBadgeColor[user.role] || {
    bg: 'bg-slate-500/10 border-slate-500/30',
    text: 'text-slate-300',
    label: user.role,
  };

  const getStatusBadge = () => {
    if (user.isDeleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <Lock className="w-3 h-3" /> Đã xóa / Vô hiệu hóa
        </span>
      );
    }
    switch (user.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
          </span>
        );
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Lock className="w-3 h-3" /> Đã khóa
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Chờ xác thực
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Hồ sơ người dùng #{user.id}</h3>
              <p className="text-xs text-slate-400">Xem đầy đủ thông tin tài khoản và phân quyền</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* User overview card */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-2xl shrink-0 overflow-hidden shadow-lg shadow-amber-500/10">
              {user.urlAvt ? (
                <img src={user.urlAvt} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user.fullName?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-white text-lg truncate">{user.fullName}</h4>
                {user.isVip && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Crown className="w-3 h-3" /> VIP
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 truncate mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleMeta.bg} ${roleMeta.text}`}>
                  {roleMeta.label}
                </span>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Địa chỉ Email
              </span>
              <p className="text-sm font-medium text-slate-200 break-all">{user.email}</p>
            </div>

            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Số điện thoại
              </span>
              <p className="text-sm font-medium text-slate-200">{user.phoneNumber || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Ngày sinh
              </span>
              <p className="text-sm font-medium text-slate-200">
                {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" /> Giới tính
              </span>
              <p className="text-sm font-medium text-slate-200">
                {user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Nghề nghiệp
              </span>
              <p className="text-sm font-medium text-slate-200">{user.career || 'Chưa cập nhật'}</p>
            </div>

            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Shield className="w-3.5 h-3.5 text-slate-500" /> Ngày tạo tài khoản
              </span>
              <p className="text-sm font-medium text-slate-200">
                {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : 'N/A'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-1 sm:col-span-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Địa chỉ giao hàng / cư trú
              </span>
              <p className="text-sm font-medium text-slate-200">{user.address || 'Chưa cập nhật'}</p>
            </div>

            {user.isVip && user.vipExpiration && (
              <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1 sm:col-span-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <Crown className="w-3.5 h-3.5" /> Thời hạn VIP
                </span>
                <p className="text-sm font-medium text-amber-200">
                  Hết hạn ngày: {new Date(user.vipExpiration).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              onClose();
              onOpenResetPassword(user);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Đặt lại mật khẩu</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenEdit(user);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

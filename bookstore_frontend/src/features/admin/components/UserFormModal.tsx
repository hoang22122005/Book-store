import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type {
  AdminUserResponse,
  CreateUserByAdminRequest,
  UpdateUserByAdminRequest,
  AccountStatus,
} from '../../../types/api/user';
import type { UserRole } from '../../../types/api/auth';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (data: CreateUserByAdminRequest) => Promise<void>;
  onSubmitUpdate: (userId: number, data: UpdateUserByAdminRequest) => Promise<void>;
  userToEdit: AdminUserResponse | null;
  isSubmitting: boolean;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: 'USER', label: 'Khách hàng (USER)', description: 'Người dùng mua sắm thông thường' },
  { value: 'STAFF', label: 'Nhân viên (STAFF)', description: 'Xử lý đơn hàng và hỗ trợ trò chuyện' },
  { value: 'ACCOUNTANT', label: 'Kế toán (ACCOUNTANT)', description: 'Xem doanh thu và báo cáo tài chính' },
  { value: 'WAREHOUSE_KEEPER', label: 'Thủ kho (WAREHOUSE_KEEPER)', description: 'Quản lý kho và nhập hàng' },
  { value: 'ADMIN', label: 'Quản trị viên (ADMIN)', description: 'Toàn quyền quản trị hệ thống' },
];

const statusOptions: { value: AccountStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'PENDING', label: 'Chờ xác thực' },
  { value: 'LOCKED', label: 'Đã khóa' },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  userToEdit,
  isSubmitting,
}) => {
  const isEditing = Boolean(userToEdit);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('USER');
  const [status, setStatus] = useState<AccountStatus>('ACTIVE');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [career, setCareer] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.fullName || '');
      setEmail(userToEdit.email || '');
      setPassword('');
      setRole(userToEdit.role || 'USER');
      setStatus(userToEdit.status || 'ACTIVE');
      setPhone(userToEdit.phoneNumber || '');
      setAddress(userToEdit.address || '');
      setDob(userToEdit.dob || '');
      setGender((userToEdit.gender as 'MALE' | 'FEMALE' | 'OTHER') || '');
      setCareer(userToEdit.career || '');
      setIsVip(userToEdit.isVip || false);
      setIsDeleted(userToEdit.isDeleted || false);
      setError(null);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('USER');
      setStatus('ACTIVE');
      setPhone('');
      setAddress('');
      setDob('');
      setGender('');
      setCareer('');
      setIsVip(false);
      setIsDeleted(false);
      setError(null);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Họ và tên không được để trống.');
      return;
    }

    if (!isEditing) {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        setError('Vui lòng nhập địa chỉ email hợp lệ.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }

      const createData: CreateUserByAdminRequest = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        status,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        dob: dob || undefined,
        gender: gender || undefined,
        career: career.trim() || undefined,
        isVip,
      };

      try {
        await onSubmitCreate(createData);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo người dùng');
      }
    } else if (userToEdit) {
      const updateData: UpdateUserByAdminRequest = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        dob: dob || undefined,
        gender: gender || undefined,
        career: career.trim() || undefined,
        role,
        status,
        isVip,
        isDeleted,
      };

      try {
        await onSubmitUpdate(userToEdit.id, updateData);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật người dùng');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {isEditing ? `Chỉnh sửa: ${userToEdit?.fullName}` : 'Thêm người dùng mới'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Cập nhật thông tin chi tiết và phân quyền' : 'Tạo mới tài khoản khách hàng hoặc nhân sự'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Họ và tên <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@bookstore.com"
                disabled={isEditing}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors ${
                  isEditing ? 'opacity-60 cursor-not-allowed bg-slate-900' : ''
                }`}
              />
            </div>

            {/* Password (only for create) */}
            {!isEditing && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mật khẩu khởi tạo <span className="text-red-400">*</span> (tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vai trò (Role) <span className="text-red-400">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trạng thái tài khoản</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0987654321"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER' | '')}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Chưa xác định</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ngày sinh</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Career */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nghề nghiệp</label>
              <input
                type="text"
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                placeholder="Kỹ sư, Giáo viên, Sinh viên..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Địa chỉ</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Extra Options */}
            <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                />
                <span className="font-semibold text-amber-400">Khách hàng VIP</span>
              </label>

              {isEditing && (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={isDeleted}
                    onChange={(e) => setIsDeleted(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-red-500 focus:ring-red-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-red-400">Vô hiệu hóa (isDeleted)</span>
                </label>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Tạo người dùng</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

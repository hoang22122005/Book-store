import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Search,
  Plus,
  RefreshCw,
  Edit,
  Eye,
  KeyRound,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import {
  useAdminUsersQuery,
  useAdminUserStatsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useResetPasswordMutation,
  useDeleteUserMutation,
} from '../../features/admin/hooks/useAdminUsers';
import { UserFormModal } from '../../features/admin/components/UserFormModal';
import { UserDetailModal } from '../../features/admin/components/UserDetailModal';
import { ResetPasswordModal } from '../../features/admin/components/ResetPasswordModal';
import type {
  AdminUserResponse,
  AccountStatus,
  CreateUserByAdminRequest,
  UpdateUserByAdminRequest,
} from '../../types/api/user';
import type { UserRole } from '../../types/api/auth';
import { useAuth } from '../../hooks/useAuth';

const roleMeta: Record<UserRole, { label: string; badgeClass: string }> = {
  ADMIN: { label: 'Quản trị viên', badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30' },
  STAFF: { label: 'Nhân viên', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  ACCOUNTANT: { label: 'Kế toán', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  WAREHOUSE_KEEPER: { label: 'Thủ kho', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  USER: { label: 'Khách hàng', badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-700' },
  CLONE: { label: 'Clone', badgeClass: 'bg-slate-700/10 text-slate-500 border-slate-700' },
};

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Filters & Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus | 'ALL'>('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AdminUserResponse | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUserResponse | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUserResponse | null>(null);

  // Queries & Mutations
  const { data: statsData, refetch: refetchStats } = useAdminUserStatsQuery();
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch: refetchUsers,
    isFetching,
  } = useAdminUsersQuery({
    keyword: searchKeyword,
    role: selectedRole,
    status: selectedStatus,
    page,
    size: pageSize,
    sort: 'userId,desc',
  });

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const updateStatusMutation = useUpdateUserStatusMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const deleteMutation = useDeleteUserMutation();

  const users = useMemo(() => usersData?.content ?? [], [usersData]);
  const totalElements = usersData?.totalElements ?? 0;
  const totalPages = usersData?.totalPages ?? 0;

  const handleRefresh = () => {
    refetchUsers();
    refetchStats();
  };

  const handleCreateSubmit = async (data: CreateUserByAdminRequest) => {
    await createMutation.mutateAsync(data);
    handleRefresh();
  };

  const handleUpdateSubmit = async (userId: number, data: UpdateUserByAdminRequest) => {
    await updateMutation.mutateAsync({ userId, request: data });
    handleRefresh();
  };

  const handleRoleChange = async (userId: number, role: UserRole) => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
      handleRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể cập nhật vai trò');
    }
  };

  const handleToggleLock = async (user: AdminUserResponse) => {
    const isCurrentlyLocked = user.status === 'LOCKED' || user.isDeleted;
    const nextStatus: AccountStatus = isCurrentlyLocked ? 'ACTIVE' : 'LOCKED';
    const confirmMsg = isCurrentlyLocked
      ? `Mở khóa tài khoản cho "${user.fullName}" (${user.email})?`
      : `Khóa tài khoản "${user.fullName}" (${user.email})?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateStatusMutation.mutateAsync({
        userId: user.id,
        request: { status: nextStatus, isDeleted: !isCurrentlyLocked ? false : false },
      });
      handleRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể đổi trạng thái tài khoản');
    }
  };

  const handleDeleteToggle = async (user: AdminUserResponse) => {
    const confirmMsg = user.isDeleted
      ? `Khôi phục tài khoản "${user.fullName}"?`
      : `Vô hiệu hóa (xóa mềm) tài khoản "${user.fullName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteMutation.mutateAsync(user.id);
      handleRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể thay đổi trạng thái tài khoản');
    }
  };

  const handleResetPasswordSubmit = async (userId: number, newPassword: string) => {
    await resetPasswordMutation.mutateAsync({ userId, request: { newPassword } });
  };

  const renderStatusBadge = (user: AdminUserResponse) => {
    if (user.isDeleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <UserX className="w-3 h-3" /> Đã vô hiệu hóa
        </span>
      );
    }
    if (user.status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
        </span>
      );
    }
    if (user.status === 'LOCKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <Lock className="w-3 h-3" /> Đã khóa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Chờ xác thực
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 pb-12">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-slate-400">
            Quản trị tài khoản khách hàng, phân quyền nhân sự, theo dõi trạng thái và hoạt động.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button
            onClick={() => {
              setUserToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tổng người dùng</p>
            <h3 className="text-xl font-bold text-white mt-0.5">{statsData?.totalUsers ?? '...'}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Đang hoạt động</p>
            <h3 className="text-xl font-bold text-emerald-400 mt-0.5">{statsData?.activeUsers ?? '...'}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Quản trị & Nhân sự</p>
            <h3 className="text-xl font-bold text-purple-300 mt-0.5">{statsData?.staffAndAdmins ?? '...'}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Khách hàng VIP</p>
            <h3 className="text-xl font-bold text-amber-400 mt-0.5">{statsData?.vipUsers ?? '...'}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-3.5 col-span-2 sm:col-span-1">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Đã khóa / Xóa</p>
            <h3 className="text-xl font-bold text-rose-400 mt-0.5">{statsData?.lockedUsers ?? '...'}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Select filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Vai trò:</span>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as UserRole | 'ALL');
                  setPage(0);
                }}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="USER">Khách hàng (USER)</option>
                <option value="STAFF">Nhân viên (STAFF)</option>
                <option value="ACCOUNTANT">Kế toán (ACCOUNTANT)</option>
                <option value="WAREHOUSE_KEEPER">Thủ kho (WAREHOUSE_KEEPER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Trạng thái:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as AccountStatus | 'ALL');
                  setPage(0);
                }}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="PENDING">Chờ xác thực</option>
                <option value="LOCKED">Đã khóa / Xóa</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
                <option value="50">50 / trang</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="font-bold text-white text-base">Danh sách người dùng</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isLoading ? 'Đang tải dữ liệu...' : `Tìm thấy ${totalElements} tài khoản`}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <span className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-sm font-medium">Đang tải danh sách người dùng...</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-300">{error?.message || 'Có lỗi xảy ra khi tải dữ liệu'}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20"
            >
              Thử lại
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-medium">Không tìm thấy người dùng nào phù hợp</p>
            <p className="text-xs text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/50">
                    <th className="px-5 py-3.5">Người dùng</th>
                    <th className="px-4 py-3.5">Liên hệ</th>
                    <th className="px-4 py-3.5">Vai trò</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5">VIP</th>
                    <th className="px-4 py-3.5">Ngày tạo</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((user) => {
                    const isCurrent = currentUser?.email?.toLowerCase() === user.email?.toLowerCase();
                    const currentRoleMeta = roleMeta[user.role] || {
                      label: user.role,
                      badgeClass: 'bg-slate-800 text-slate-300',
                    };

                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors hover:bg-slate-900/50 ${
                          user.isDeleted || user.status === 'LOCKED' ? 'opacity-70 bg-slate-950/40' : ''
                        }`}
                      >
                        {/* User info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-base shrink-0 overflow-hidden shadow-sm">
                              {user.urlAvt ? (
                                <img src={user.urlAvt} alt={user.fullName} className="w-full h-full object-cover" />
                              ) : (
                                user.fullName?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white truncate">{user.fullName}</span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
                                    BẠN
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone & Address */}
                        <td className="px-4 py-4">
                          <p className="text-xs text-slate-200 font-medium">{user.phoneNumber || '—'}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5" title={user.address || ''}>
                            {user.address || '—'}
                          </p>
                        </td>

                        {/* Role Select / Badge */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={user.role}
                              disabled={isCurrent}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none transition-colors cursor-pointer disabled:cursor-not-allowed ${currentRoleMeta.badgeClass} bg-slate-950`}
                            >
                              <option value="USER">USER</option>
                              <option value="STAFF">STAFF</option>
                              <option value="ACCOUNTANT">ACCOUNTANT</option>
                              <option value="WAREHOUSE_KEEPER">WAREHOUSE_KEEPER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">{renderStatusBadge(user)}</td>

                        {/* VIP */}
                        <td className="px-4 py-4">
                          {user.isVip ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Crown className="w-3 h-3" /> VIP
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Thường</span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailUser(user)}
                              title="Xem chi tiết"
                              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setUserToEdit(user);
                                setIsFormOpen(true);
                              }}
                              title="Chỉnh sửa thông tin"
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setResetPasswordUser(user)}
                              title="Đặt lại mật khẩu"
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {!isCurrent && (
                              <>
                                <button
                                  onClick={() => handleToggleLock(user)}
                                  title={user.status === 'LOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    user.status === 'LOCKED'
                                      ? 'text-emerald-400 hover:bg-emerald-500/20'
                                      : 'text-rose-400 hover:bg-rose-500/20'
                                  }`}
                                >
                                  {user.status === 'LOCKED' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                </button>

                                <button
                                  onClick={() => handleDeleteToggle(user)}
                                  title={user.isDeleted ? 'Khôi phục tài khoản' : 'Vô hiệu hóa tài khoản'}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    user.isDeleted
                                      ? 'text-sky-400 hover:bg-sky-500/20'
                                      : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                                  }`}
                                >
                                  {user.isDeleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/40">
                <span className="text-xs text-slate-400">
                  Trang <strong className="text-white">{page + 1}</strong> trên <strong className="text-white">{totalPages}</strong> ({totalElements} người dùng)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setUserToEdit(null);
        }}
        onSubmitCreate={handleCreateSubmit}
        onSubmitUpdate={handleUpdateSubmit}
        userToEdit={userToEdit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <UserDetailModal
        isOpen={Boolean(detailUser)}
        onClose={() => setDetailUser(null)}
        user={detailUser}
        onOpenEdit={(user) => {
          setUserToEdit(user);
          setIsFormOpen(true);
        }}
        onOpenResetPassword={(user) => {
          setResetPasswordUser(user);
        }}
      />

      <ResetPasswordModal
        isOpen={Boolean(resetPasswordUser)}
        onClose={() => setResetPasswordUser(null)}
        user={resetPasswordUser}
        onResetPassword={handleResetPasswordSubmit}
        isSubmitting={resetPasswordMutation.isPending}
      />
    </div>
  );
};

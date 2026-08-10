import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, Heart, LogOut, Save, KeyRound } from 'lucide-react';
import { useUserProfile, useUpdateProfile, useChangePassword, useUploadAvatar } from '../../features/user/hooks';
import { useLogout } from '../../features/auth/hooks';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const { data: user, isLoading } = useUserProfile();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/login';
      },
    });
  };

  return (
    <div className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 sticky top-24">
            {/* User Info */}
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                title="Thay đổi ảnh đại diện"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </button>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{user?.name || 'Người dùng'}</h2>
              <p className="text-caption text-on-surface-variant">Khách hàng thân thiết</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <User size={20} />
                Hồ sơ cá nhân
              </button>
              <Link
                to="/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <Package size={20} />
                Đơn hàng của tôi
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <Heart size={20} />
                Sách yêu thích
              </Link>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'password'
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <KeyRound size={20} />
                Đổi mật khẩu
              </button>
              <hr className="border-outline-variant my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
              >
                <LogOut size={20} />
                Đăng xuất
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileForm user={user} isLoading={isLoading} />}
          {activeTab === 'password' && <ChangePasswordForm />}
        </div>
      </div>

      <AvatarEditModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={user?.avatarUrl}
        userName={user?.name}
      />
    </div>
  );
};

interface ProfileFormProps {
  user?: {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    gender?: string;
    career?: string;
    avatarUrl?: string;
  };
  isLoading: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, isLoading }) => {
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    career: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || '',
        career: user.career || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 animate-pulse space-y-4">
        <div className="h-8 bg-surface-variant rounded w-1/3"></div>
        <div className="h-4 bg-surface-variant rounded w-1/2"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-surface-variant rounded"></div>
          <div className="h-10 bg-surface-variant rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-2">Thông tin cá nhân</h1>
      <p className="text-on-surface-variant mb-6">Cập nhật thông tin cơ bản để chúng tôi hỗ trợ bạn tốt hơn.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Họ và tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface-variant cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Giới tính</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Chọn giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Địa chỉ</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            placeholder="Nhập địa chỉ"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {updateProfileMutation.isSuccess && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">Cập nhật thành công!</div>
        )}
        {updateProfileMutation.isError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{updateProfileMutation.error.message}</div>
        )}
      </form>
    </div>
  );
};

interface AvatarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  userName?: string;
}

const AvatarEditModal: React.FC<AvatarEditModalProps> = ({ isOpen, onClose, currentAvatarUrl, userName }) => {
  const uploadAvatarMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (file.size > MAX_FILE_SIZE) {
      setError('Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadAvatarMutation.mutate(selectedFile, {
      onSuccess: () => {
        setPreview(undefined);
        setSelectedFile(null);
        setError('');
        onClose();
      },
    });
  };

  const handleClose = () => {
    setPreview(undefined);
    setSelectedFile(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-surface-container-lowest rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-on-surface mb-4">Thay đổi ảnh đại diện</h3>

        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center overflow-hidden ring-4 ring-outline-variant">
            {preview || currentAvatarUrl ? (
              <img src={preview ?? currentAvatarUrl} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-4xl font-bold">{userName?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 border-2 border-outline-variant text-on-surface font-medium rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Chọn ảnh mới
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploadAvatarMutation.isPending}
            className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {uploadAvatarMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tải lên...
              </>
            ) : (
              'Lưu ảnh'
            )}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 text-on-surface-variant font-medium rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            Hủy
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
        )}

        {uploadAvatarMutation.isError && (
          <p className="text-sm text-red-600 mt-3 text-center">{uploadAvatarMutation.error.message}</p>
        )}
      </div>
    </div>
  );
};

const ChangePasswordForm: React.FC = () => {
  const changePasswordMutation = useChangePassword();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrors('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    changePasswordMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      },
    });
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold mb-2">Đổi mật khẩu</h2>
      <p className="text-on-surface-variant mb-6">Đảm bảo tài khoản của bạn đang sử dụng một mật khẩu dài, ngẫu nhiên để an toàn.</p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Nhập mật khẩu hiện tại"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Nhập mật khẩu mới"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Nhập lại mật khẩu mới"
            required
          />
        </div>

        {errors && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errors}</div>}

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary-fixed transition-colors disabled:opacity-50 cursor-pointer"
        >
          <KeyRound size={18} />
          {changePasswordMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>

        {changePasswordMutation.isSuccess && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">Đổi mật khẩu thành công!</div>
        )}
        {changePasswordMutation.isError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{changePasswordMutation.error.message}</div>
        )}
      </form>
    </div>
  );
};

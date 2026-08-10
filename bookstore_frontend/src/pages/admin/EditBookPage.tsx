import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Save } from 'lucide-react';
import { useAdminBookDetail, useAdminUpdateBookMutation } from '../../features/admin';
import { useCategories } from '../../features/catalog/hooks/useCategories';

interface BookForm {
  name: string;
  author: string;
  description: string;
  publisher: string;
  publishYear: string;
  pageCount: string;
  price: string;
  quantityInStock: string;
  genreName: string;
  isDeleted: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const EditBookPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { data: genres = [] } = useCategories();
  const { data: book, isLoading: isLoadingBook } = useAdminBookDetail(Number(bookId));
  const updateMutation = useAdminUpdateBookMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BookForm>({
    name: '',
    author: '',
    description: '',
    publisher: '',
    publishYear: '',
    pageCount: '',
    price: '',
    quantityInStock: '',
    genreName: '',
    isDeleted: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setForm({
        name: book.name || '',
        author: book.author || '',
        description: book.description || '',
        publisher: book.publisher || '',
        publishYear: book.publishYear?.toString() || '',
        pageCount: book.pageCount?.toString() || '',
        price: book.price?.toString() || '',
        quantityInStock: book.quantityInStock?.toString() || '0',
        genreName: book.genres?.[0] || '',
        isDeleted: book.isDeleted || false,
      });
      if (book.urlImg) {
        setImagePreview(book.urlImg);
      }
    }
  }, [book]);

  const handleChange = (field: keyof BookForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Vui lòng chọn file ảnh' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Ảnh không được vượt quá 5MB' }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) newErrors.name = 'Tên sách phải từ 2 ký tự';
    if (!form.author.trim() || form.author.trim().length < 2) newErrors.author = 'Tác giả phải từ 2 ký tự';
    if (!form.description.trim()) newErrors.description = 'Mô tả không được để trống';
    if (!form.publisher.trim()) newErrors.publisher = 'Nhà xuất bản không được để trống';
    if (!form.publishYear || Number(form.publishYear) <= 0) newErrors.publishYear = 'Năm xuất bản phải lớn hơn 0';
    if (!form.pageCount || Number(form.pageCount) <= 0) newErrors.pageCount = 'Số trang phải lớn hơn 0';
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Giá phải lớn hơn 0';
    if (form.quantityInStock === '' || Number(form.quantityInStock) < 0) newErrors.quantityInStock = 'Số lượng phải >= 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !bookId) return;

    const bookUpdateRequest = {
      name: form.name.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      quantityInStock: Number(form.quantityInStock),
      publisher: form.publisher.trim(),
      publishYear: Number(form.publishYear),
      price: Number(form.price),
      isVip: false,
      isDeleted: form.isDeleted,
      pageCount: Number(form.pageCount),
    };

    const formData = new FormData();
    formData.append('bookUpdateRequest', new Blob([JSON.stringify(bookUpdateRequest)], { type: 'application/json' }));
    if (imageFile) {
      formData.append('imgFile', imageFile);
    } else {
      const placeholder = new Blob([], { type: 'application/octet-stream' });
      formData.append('imgFile', placeholder, 'empty');
    }

    updateMutation.mutate(
      { bookId: Number(bookId), formData },
      {
        onSuccess: () => {
          navigate('/admin/books');
        },
      }
    );
  };

  if (isLoadingBook) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        <span className="ml-3 text-sm text-slate-400">Đang tải...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-20 text-red-400">Không tìm thấy sách</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Chỉnh Sửa Sách</h1>
          <p className="mt-1 text-sm text-slate-400">Cập nhật thông tin sách "{book.name}"</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/books')}
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save size={16} />
            {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-5 text-lg font-bold text-white">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Tên sách <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Tác giả <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => handleChange('author', e.target.value)}
                    className={`w-full rounded-xl border ${errors.author ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.author && <p className="mt-1 text-xs text-red-400">{errors.author}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Nhà xuất bản <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => handleChange('publisher', e.target.value)}
                    className={`w-full rounded-xl border ${errors.publisher ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.publisher && <p className="mt-1 text-xs text-red-400">{errors.publisher}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Năm xuất bản <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.publishYear}
                    onChange={(e) => handleChange('publishYear', e.target.value)}
                    min="1"
                    className={`w-full rounded-xl border ${errors.publishYear ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.publishYear && <p className="mt-1 text-xs text-red-400">{errors.publishYear}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Tồn kho</label>
                  <input
                    type="number"
                    value={form.quantityInStock}
                    onChange={(e) => handleChange('quantityInStock', e.target.value)}
                    min="0"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-5 text-lg font-bold text-white">Mô tả</h2>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={5}
              className={`w-full rounded-xl border ${errors.description ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-3 text-sm text-white focus:border-amber-500 focus:outline-none resize-none`}
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
          </section>

          {/* Price & Pages */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-5 text-lg font-bold text-white">Giá cả & Định dạng</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Giá niêm yết (VND) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  min="1"
                  className={`w-full rounded-xl border ${errors.price ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none`}
                />
                {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Số trang <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  value={form.pageCount}
                  onChange={(e) => handleChange('pageCount', e.target.value)}
                  min="1"
                  className={`w-full rounded-xl border ${errors.pageCount ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 focus:outline-none`}
                />
                {errors.pageCount && <p className="mt-1 text-xs text-red-400">{errors.pageCount}</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Image Upload */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Ảnh bìa sách</h2>
            <div
              onClick={() => !imagePreview && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${errors.image ? 'border-red-500' : 'border-slate-700'} ${!imagePreview ? 'cursor-pointer hover:border-amber-500' : ''} bg-slate-900 p-6 transition-colors`}
            >
              {imagePreview ? (
                <div className="relative w-full">
                  <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 rounded-full bg-amber-500/10 p-3">
                    <Upload className="text-amber-400" size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Nhấn để tải ảnh lên</p>
                  <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP (Tối đa 5MB)</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.image && <p className="mt-2 text-xs text-red-400">{errors.image}</p>}
          </section>

          {/* Status */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Trạng thái</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDeleted}
                onChange={(e) => handleChange('isDeleted', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-slate-300">Ngừng kinh doanh (ẩn sách)</span>
            </label>
          </section>

          {/* Error from server */}
          {updateMutation.isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {updateMutation.error.message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

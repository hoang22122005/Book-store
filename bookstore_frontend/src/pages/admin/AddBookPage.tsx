import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';
import { useAdminAddBookMutation } from '../../features/admin';
import { useCategories } from '../../features/catalog/hooks/useCategories';

interface BookForm {
  name: string;
  author: string;
  description: string;
  publisher: string;
  publishYear: string;
  isbn: string;
  pageCount: string;
  price: string;
  genreName: string;
}

const INITIAL_FORM: BookForm = {
  name: '',
  author: '',
  description: '',
  publisher: '',
  publishYear: '',
  isbn: '',
  pageCount: '',
  price: '',
  genreName: '',
};

interface FormErrors {
  [key: string]: string;
}

export const AddBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: genres = [] } = useCategories();
  const addBookMutation = useAdminAddBookMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BookForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    if (!form.genreName) newErrors.genreName = 'Vui lòng chọn danh mục';
    if (!imageFile) newErrors.image = 'Vui lòng chọn ảnh bìa';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const bookAddRequest = {
      name: form.name.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
      quantityInStock: 0,
      publisher: form.publisher.trim(),
      publishYear: Number(form.publishYear),
      price: Number(form.price),
      isVip: false,
      pageCount: Number(form.pageCount),
      genreName: form.genreName,
    };

    const formData = new FormData();
    formData.append('bookAddRequest', new Blob([JSON.stringify(bookAddRequest)], { type: 'application/json' }));
    formData.append('imgFile', imageFile!);

    addBookMutation.mutate(formData, {
      onSuccess: () => {
        navigate('/admin/books');
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thêm Sách Mới</h1>
          <p className="mt-1 text-sm text-slate-400">Nhập thông tin chi tiết để thêm sách vào kho lưu trữ.</p>
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
            disabled={addBookMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save size={16} />
            {addBookMutation.isPending ? 'Đang lưu...' : 'Lưu sách'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
              <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </span>
              Thông tin cơ bản
            </h2>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Tên sách <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nhập tên sách..."
                  className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>

              {/* Author + Publisher */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Tác giả <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => handleChange('author', e.target.value)}
                    placeholder="Nhập tên tác giả..."
                    className={`w-full rounded-xl border ${errors.author ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.author && <p className="mt-1 text-xs text-red-400">{errors.author}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Nhà xuất bản <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.publisher}
                    onChange={(e) => handleChange('publisher', e.target.value)}
                    placeholder="VD: NXB Trẻ..."
                    className={`w-full rounded-xl border ${errors.publisher ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.publisher && <p className="mt-1 text-xs text-red-400">{errors.publisher}</p>}
                </div>
              </div>

              {/* ISBN + Publish Year */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">ISBN</label>
                  <input
                    type="text"
                    value={form.isbn}
                    onChange={(e) => handleChange('isbn', e.target.value)}
                    placeholder="Mã ISBN..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Năm xuất bản <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.publishYear}
                    onChange={(e) => handleChange('publishYear', e.target.value)}
                    placeholder="YYYY"
                    min="1"
                    className={`w-full rounded-xl border ${errors.publishYear ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.publishYear && <p className="mt-1 text-xs text-red-400">{errors.publishYear}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Category & Description */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
              <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.93a2 2 0 01-1.66-.9l-.82-1.2A2 2 0 007.93 3H4a2 2 0 00-2 2v13c0 1.1.9 2 2 2z"/></svg>
              </span>
              Phân loại & Mô tả
            </h2>
            <div className="space-y-4">
              {/* Genre */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Danh mục <span className="text-red-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <button
                      key={g.genreId}
                      type="button"
                      onClick={() => handleChange('genreName', g.name)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        form.genreName === g.name
                          ? 'bg-amber-500 text-slate-900'
                          : 'border border-slate-700 bg-slate-900 text-slate-400 hover:border-amber-500 hover:text-amber-400'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
                {errors.genreName && <p className="mt-1 text-xs text-red-400">{errors.genreName}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Mô tả sách <span className="text-red-400">*</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Nhập mô tả nội dung sách..."
                  rows={5}
                  className={`w-full rounded-xl border ${errors.description ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none resize-none`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
              </div>
            </div>
          </section>

          {/* Price & Inventory */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
              <span className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 2v20M2 12h20"/></svg>
              </span>
              Giá cả & Kho hàng
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Giá niêm yết (VND) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0"
                    min="1"
                    className={`w-full rounded-xl border ${errors.price ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Số trang <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.pageCount}
                    onChange={(e) => handleChange('pageCount', e.target.value)}
                    placeholder="0"
                    min="1"
                    className={`w-full rounded-xl border ${errors.pageCount ? 'border-red-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none`}
                  />
                  {errors.pageCount && <p className="mt-1 text-xs text-red-400">{errors.pageCount}</p>}
                </div>
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

          {/* Error from server */}
          {addBookMutation.isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {addBookMutation.error.message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

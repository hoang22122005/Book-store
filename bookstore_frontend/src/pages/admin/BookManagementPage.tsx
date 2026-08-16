import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, BookOpen, ImageOff } from 'lucide-react';
import { useAdminBookList, useAdminDeleteBookMutation } from '../../features/admin';
import { useCategories } from '../../features/catalog/hooks/useCategories';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils';



export const BookManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [authorFilter, setAuthorFilter] = useState('');
  const [inStock, setInStock] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);
  const size = 10;

  const { data: genres = [] } = useCategories();

  const { data, isLoading, isError, refetch } = useAdminBookList({
    keyword: searchKeyword || undefined,
    categoryId,
    author: authorFilter || undefined,
    inStock,
    page,
    size,
    sort: 'bookId,desc',
  });

  const deleteMutation = useAdminDeleteBookMutation();

  const books = useMemo(() => data?.content || [], [data]);
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const authors = useMemo(() => {
    const set = new Set(books.map((b) => b.author).filter(Boolean));
    return Array.from(set);
  }, [books]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(keyword);
    setPage(0);
  };

  const handleDelete = (bookId: number, bookName: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa sách "${bookName}"?`)) {
      deleteMutation.mutate(bookId);
    }
  };

  const startItem = page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý sách</h1>
          <p className="mt-1 text-sm text-slate-400">Quản lý danh sách sách trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/admin/books/add')}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Thêm sách mới
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm tên sách..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </form>

          {/* Category filter */}
          <select
            value={categoryId ?? ''}
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {genres.map((g) => (
              <option key={g.genreId} value={g.genreId}>{g.name}</option>
            ))}
          </select>

          {/* Author filter */}
          <select
            value={authorFilter}
            onChange={(e) => {
              setAuthorFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả tác giả</option>
            {authors.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Stock filter */}
          <select
            value={inStock === undefined ? '' : inStock ? 'true' : 'false'}
            onChange={(e) => {
              setInStock(e.target.value === '' ? undefined : e.target.value === 'true');
              setPage(0);
            }}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả tồn kho</option>
            <option value="true">Còn hàng</option>
            <option value="false">Hết hàng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <span className="ml-3 text-sm text-slate-400">Đang tải...</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-red-400 text-sm font-medium">Không thể tải danh sách sách</span>
            <button
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Ảnh bìa</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Tên sách</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Tác giả</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Danh mục</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Giá bán</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Tồn kho</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Trạng thái</th>
                    {isAdmin && <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 8 : 7} className="px-4 py-16 text-center text-slate-500">
                        <BookOpen className="mx-auto mb-3 text-slate-600" size={40} />
                        <p className="font-medium">Không tìm thấy sách nào</p>
                      </td>
                    </tr>
                  )}
                  {books.map((book) => (
                    <tr
                      key={book.bookId}
                      className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {book.urlImg ? (
                          <img
                            src={book.urlImg}
                            alt={book.name}
                            className="h-12 w-9 rounded-lg object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="flex h-12 w-9 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                            <ImageOff className="text-slate-600" size={16} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-white line-clamp-1">{book.name}</span>
                        {book.isVip && (
                          <span className="ml-1.5 inline-block rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">VIP</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{book.author}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(book.genres || []).slice(0, 2).map((g) => (
                            <span key={g} className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-amber-300">
                        {formatCurrency(Number(book.price))}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{book.quantityInStock}</td>
                      <td className="px-4 py-3">
                        {!book.isDeleted ? (
                          <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                            Đang kinh doanh
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-slate-600/20 px-2.5 py-1 text-xs font-semibold text-slate-500">
                            Ngừng kinh doanh
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin/books/${book.bookId}/edit`)}
                              className="rounded-lg p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(book.bookId, book.name)}
                              disabled={deleteMutation.isPending}
                              className="rounded-lg p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer disabled:opacity-50"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Hiển thị {startItem} đến {endItem} trong {totalElements} kết quả
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[32px] rounded-lg px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          page === pageNum
                            ? 'bg-amber-500 text-slate-900'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

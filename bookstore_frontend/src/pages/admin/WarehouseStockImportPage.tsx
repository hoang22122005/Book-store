import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Plus, Search, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Pencil, Check } from 'lucide-react';
import { useStockImportList, useStockImportDetail } from '../../features/warehouse';
import { useCreateDraftMutation, useAddDetailMutation, useUpdateDetailMutation, usePostImportMutation, useCancelImportMutation, useDeleteImportMutation } from '../../features/warehouse';
import { useBooksQuery } from '../../features/catalog';
import type { StockImportDetailResponse } from '../../types/api/stockImport';

type ViewMode = 'list' | 'create' | 'detail';

export const WarehouseStockImportPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Luôn khởi tạo về mặc định; useEffect sẽ khôi phục từ location.state nếu có
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedImportId, setSelectedImportId] = useState<number | null>(null);

  // Khôi phục context phiếu nhập khi quay về từ trang tạo sách mới
  useEffect(() => {
    if (location.state?.importId) {
      setSelectedImportId(location.state.importId);
      setViewMode('detail');
      // Xóa state khỏi history để tránh khôi phục lại khi reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create form state
  const [note, setNote] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<{ id: number; title: string; price: number } | null>(null);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [importPrice, setImportPrice] = useState<number | ''>('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Edit detail state
  const [editingDetailId, setEditingDetailId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState<number | ''>(1);
  const [editImportPrice, setEditImportPrice] = useState<number | ''>('');

  const isPriceWarning = selectedBook && importPrice !== '' && Number(importPrice) > selectedBook.price;

  // Queries
  const { data: imports = [], isLoading, isError, refetch } = useStockImportList();
  const { data: selectedImport } = useStockImportDetail(selectedImportId ?? 0);
  const { data: bookPage } = useBooksQuery({ keyword: searchQuery || undefined, size: 20 });
  const searchResults = useMemo(() => bookPage?.content || [], [bookPage]);

  // Mutations
  const createDraftMutation = useCreateDraftMutation();
  const addDetailMutation = useAddDetailMutation();
  const updateDetailMutation = useUpdateDetailMutation();
  const postImportMutation = usePostImportMutation();
  const cancelImportMutation = useCancelImportMutation();
  const deleteImportMutation = useDeleteImportMutation();

  const handleCreateDraft = () => {
    createDraftMutation.mutate(
      { note: note.trim() || undefined, supplierName: supplierName.trim() || undefined },
      {
        onSuccess: (data) => {
          setViewMode('detail');
          setSelectedImportId(data.importId);
          setNote('');
          setSupplierName('');
        },
      }
    );
  };

  const handleAddDetail = () => {
    if (!selectedImportId || !selectedBookId || quantity === '' || quantity < 1 || importPrice === '' || importPrice < 0) return;

    addDetailMutation.mutate(
      { importId: selectedImportId, req: { bookId: selectedBookId, quantity, importPrice } },
      {
        onSuccess: () => {
          setSelectedBookId(null);
          setQuantity(1);
          setImportPrice('');
          setSearchQuery('');
        },
      }
    );
  };

  const handlePostImport = (importId: number) => {
    if (window.confirm('Bạn có chắc muốn xác nhận nhập kho? Tồn kho sẽ được tăng lên.')) {
      postImportMutation.mutate(importId, {
        onSuccess: () => {
          setViewMode('list');
          setSelectedImportId(null);
        },
      });
    }
  };

  const handleCancelImport = (importId: number) => {
    if (window.confirm('Bạn có chắc muốn hủy phiếu nhập này?')) {
      cancelImportMutation.mutate(importId, {
        onSuccess: () => {
          setViewMode('list');
          setSelectedImportId(null);
        },
      });
    }
  };

  const handleDeleteImport = (importId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa phiếu nhập này? Hành động này không thể hoàn tác.')) {
      deleteImportMutation.mutate(importId, {
        onSuccess: () => {
          setViewMode('list');
          setSelectedImportId(null);
        },
      });
    }
  };

  const handleStartEdit = (detail: StockImportDetailResponse) => {
    setEditingDetailId(detail.importDetailId);
    setEditQuantity(detail.quantity);
    setEditImportPrice(detail.importPrice);
  };

  const handleCancelEdit = () => {
    setEditingDetailId(null);
    setEditQuantity(1);
    setEditImportPrice('');
  };

  const handleSaveEdit = (importId: number, detailId: number, bookId: number) => {
    if (editQuantity === '' || editQuantity < 1 || editImportPrice === '' || editImportPrice < 0) return;

    updateDetailMutation.mutate(
      {
        importId,
        detailId,
        req: { bookId, quantity: editQuantity, importPrice: editImportPrice },
      },
      {
        onSuccess: () => {
          setEditingDetailId(null);
          setEditQuantity(1);
          setEditImportPrice('');
        },
      }
    );
  };

  const handleViewDetail = (importId: number) => {
    setSelectedImportId(importId);
    setViewMode('detail');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
            <Clock size={12} />
            Nháp
          </span>
        );
      case 'POSTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle size={12} />
            Đã nhập kho
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
            <XCircle size={12} />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalQuantity = (details: StockImportDetailResponse[]) => {
    return details.reduce((sum, d) => sum + d.quantity, 0);
  };

  // Render create form - Simple: just note, then create draft
  if (viewMode === 'create') {
    return (
      <div className="mx-auto w-full max-w-[600px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tạo phiếu nhập mới</h1>
            <p className="mt-1 text-sm text-slate-400">Tạo phiếu nhập trống, sau đó thêm sách vào.</p>
          </div>
        </div>

        {/* Simple form */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Nhà cung cấp</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="VD: Nhà xuất bản Trẻ, Fahasa..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Nhập lô tháng 8/2026..."
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            {/* Error */}
            {createDraftMutation.isError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle size={16} />
                {createDraftMutation.error.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setViewMode('list');
                  setNote('');
                }}
                className="flex-1 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateDraft}
                disabled={createDraftMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Package size={16} />
                {createDraftMutation.isPending ? 'Đang tạo...' : 'Tạo phiếu nhập'}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Render detail view
  if (viewMode === 'detail' && selectedImport) {
    return (
      <div className="mx-auto w-full max-w-[1200px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Phiếu nhập #{selectedImport.importId}</h1>
              {getStatusBadge(selectedImport.status)}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Tạo bởi {selectedImport.createdByName} • {formatDate(selectedImport.createdAt)}
            </p>
            {selectedImport.supplierName && (
              <p className="mt-1 text-sm text-slate-400">
                Nhà cung cấp: <span className="font-medium text-white">{selectedImport.supplierName}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedImportId(null);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            {selectedImport.status === 'DRAFT' && (
              <>
                <button
                  onClick={() => handleCancelImport(selectedImport.importId)}
                  disabled={cancelImportMutation.isPending}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <XCircle size={16} />
                  {cancelImportMutation.isPending ? 'Đang hủy...' : 'Hủy phiếu'}
                </button>
                <button
                  onClick={() => handlePostImport(selectedImport.importId)}
                  disabled={postImportMutation.isPending || selectedImport.details.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <CheckCircle size={16} />
                  {postImportMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận nhập kho'}
                </button>
              </>
            )}
            {selectedImport.status === 'CANCELLED' && (
              <button
                onClick={() => handleDeleteImport(selectedImport.importId)}
                disabled={deleteImportMutation.isPending}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
                {deleteImportMutation.isPending ? 'Đang xóa...' : 'Xóa phiếu'}
              </button>
            )}
          </div>
        </div>

        {/* Note */}
        {selectedImport.note && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-2 text-sm font-medium text-slate-400">Ghi chú</h2>
            <p className="text-sm text-white">{selectedImport.note}</p>
          </div>
        )}

        {/* Add detail form (only for DRAFT) */}
        {selectedImport.status === 'DRAFT' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Thêm sách vào phiếu</h2>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-slate-300">Tìm sách</label>
                  <Link
                    to="/admin/books/add"
                    state={{ fromImportId: selectedImport.importId }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Plus size={12} />
                    Tạo sách mới
                  </Link>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                      setSelectedBookId(null);
                      setSelectedBook(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Nhập tên sách..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                {showDropdown && searchQuery && searchResults.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900">
                    {searchResults.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setSelectedBook({ id: book.id, title: book.title, price: book.price });
                          setSearchQuery(book.title);
                          setShowDropdown(false);
                        }}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{book.title}</p>
                          <p className="text-xs text-slate-400">{book.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-amber-400">{book.price.toLocaleString('vi-VN')}đ</p>
                          <p className="text-xs text-slate-500">Tồn: {book.quantityInStock}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-32">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Số lượng</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuantity(val === '' ? '' : Math.max(1, Number(val)));
                  }}
                  min="1"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="w-40">
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Giá nhập (VNĐ)</label>
                <input
                  type="number"
                  value={importPrice}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    setImportPrice(val === '' ? '' : Math.max(0, Number(val)));
                  }}
                  min="0"
                  className={`w-full rounded-xl border ${isPriceWarning ? 'border-amber-500' : 'border-slate-700'} bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none`}
                />
              </div>
              <button
                onClick={handleAddDetail}
                disabled={
                  !selectedBookId ||
                  quantity === '' ||
                  quantity < 1 ||
                  importPrice === '' ||
                  importPrice < 0 ||
                  addDetailMutation.isPending
                }
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus size={16} />
                {addDetailMutation.isPending ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
            {isPriceWarning && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  Cảnh báo: Giá nhập ({Number(importPrice).toLocaleString('vi-VN')}đ) cao hơn giá bán niêm yết ({selectedBook!.price.toLocaleString('vi-VN')}đ). Vui lòng kiểm tra lại trước khi thêm.
                </span>
              </div>
            )}
            {addDetailMutation.isError && (
              <p className="mt-2 text-sm text-red-400">{addDetailMutation.error.message}</p>
            )}
          </section>
        )}

        {/* Details table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">STT</th>
                  <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Tên sách</th>
                  <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Mã sách</th>
                  <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Số lượng nhập</th>
                  <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Giá nhập</th>
                  {selectedImport.status === 'POSTED' && (
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Giá niêm yết (lúc nhập)</th>
                  )}
                  {selectedImport.status === 'DRAFT' && (
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {selectedImport.details.length === 0 ? (
                  <tr>
                    <td colSpan={selectedImport.status === 'POSTED' ? 6 : 5} className="px-4 py-12 text-center text-slate-500">
                      <Package className="mx-auto mb-3 text-slate-600" size={40} />
                      <p className="font-medium">Chưa có sách nào trong phiếu</p>
                    </td>
                  </tr>
                ) : (
                  selectedImport.details.map((detail, index) => {
                    const isEditing = editingDetailId === detail.importDetailId;
                    return (
                      <tr
                        key={detail.importDetailId}
                        className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-white">{detail.bookName}</td>
                        <td className="px-4 py-3 text-slate-400">#{detail.bookId}</td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-300">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                              min="1"
                              className="w-20 rounded-lg border border-amber-500 bg-slate-900 px-2 py-1 text-right text-sm text-white focus:outline-none"
                            />
                          ) : (
                            detail.quantity
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editImportPrice}
                              onChange={(e) => setEditImportPrice(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                              min="0"
                              className="w-28 rounded-lg border border-amber-500 bg-slate-900 px-2 py-1 text-right text-sm text-white focus:outline-none"
                            />
                          ) : (
                            `${detail.importPrice.toLocaleString('vi-VN')}đ`
                          )}
                        </td>
                        {selectedImport.status === 'POSTED' && (
                          <td className="px-4 py-3 text-right text-slate-300">
                            {detail.sellingPriceAtImport ? `${detail.sellingPriceAtImport.toLocaleString('vi-VN')}đ` : '—'}
                          </td>
                        )}
                        {selectedImport.status === 'DRAFT' && (
                          <td className="px-4 py-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleCancelEdit()}
                                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Hủy"
                                >
                                  <XCircle size={14} />
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(selectedImport.importId, detail.importDetailId, detail.bookId)}
                                  disabled={updateDetailMutation.isPending || editQuantity === '' || editQuantity < 1 || editImportPrice === '' || editImportPrice < 0}
                                  className="rounded-lg p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 disabled:opacity-50 transition-colors cursor-pointer"
                                  title="Lưu"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(detail)}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors cursor-pointer"
                                title="Sửa"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
              {selectedImport.details.length > 0 && (
                <tfoot>
                  <tr className="border-t border-slate-800">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-slate-400">Tổng:</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-white">
                      {getTotalQuantity(selectedImport.details)} quyển
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-amber-300">
                      {selectedImport.totalCost ? `${selectedImport.totalCost.toLocaleString('vi-VN')}đ` : ''}
                    </td>
                    {(selectedImport.status === 'POSTED' || selectedImport.status === 'DRAFT') && <td></td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Posted info */}
        {selectedImport.status === 'POSTED' && selectedImport.postedAt && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-400">
              Đã xác nhận nhập kho lúc {formatDate(selectedImport.postedAt)}
            </p>
          </div>
        )}

        {/* Cancelled info */}
        {selectedImport.status === 'CANCELLED' && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">Phiếu nhập đã bị hủy</p>
          </div>
        )}
      </div>
    );
  }

  // Render list view
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý nhập kho</h1>
          <p className="mt-1 text-sm text-slate-400">Quản lý các phiếu nhập sách vào kho</p>
        </div>
        <button
          onClick={() => setViewMode('create')}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Tạo phiếu nhập mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5">
              <Clock className="text-amber-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {imports.filter((i) => i.status === 'DRAFT').length}
              </p>
              <p className="text-xs text-slate-400">Phiếu nháp</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2.5">
              <CheckCircle className="text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {imports.filter((i) => i.status === 'POSTED').length}
              </p>
              <p className="text-xs text-slate-400">Đã nhập kho</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-500/10 p-2.5">
              <Package className="text-slate-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{imports.length}</p>
              <p className="text-xs text-slate-400">Tổng phiếu nhập</p>
            </div>
          </div>
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
            <span className="text-red-400 text-sm font-medium">Không thể tải danh sách phiếu nhập</span>
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
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Mã phiếu</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Nhà cung cấp</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Người tạo</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Ngày tạo</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Số lượng sách</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Tổng chi phí</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs">Ghi chú</th>
                    <th className="px-4 py-3 font-semibold text-slate-400 uppercase tracking-wider text-xs text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {imports.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                        <Package className="mx-auto mb-3 text-slate-600" size={40} />
                        <p className="font-medium">Chưa có phiếu nhập nào</p>
                        <p className="mt-1 text-xs">Nhấn "Tạo phiếu nhập mới" để bắt đầu</p>
                      </td>
                    </tr>
                  ) : (
                    imports.map((imp) => (
                      <React.Fragment key={imp.importId}>
                        <tr
                          className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors cursor-pointer"
                          onClick={() => handleViewDetail(imp.importId)}
                        >
                          <td className="px-4 py-3">
                            <span className="font-medium text-amber-300">#{imp.importId}</span>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(imp.status)}</td>
                          <td className="px-4 py-3 text-slate-300">{imp.supplierName || '—'}</td>
                          <td className="px-4 py-3 text-slate-300">{imp.createdByName}</td>
                          <td className="px-4 py-3 text-slate-400">{formatDate(imp.createdAt)}</td>
                          <td className="px-4 py-3 text-slate-300">{getTotalQuantity(imp.details)} quyển</td>
                          <td className="px-4 py-3 text-right text-amber-300 font-medium">
                            {imp.totalCost ? `${imp.totalCost.toLocaleString('vi-VN')}đ` : '—'}
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate text-slate-400">
                            {imp.note || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {imp.status === 'DRAFT' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePostImport(imp.importId);
                                    }}
                                    disabled={postImportMutation.isPending}
                                    className="rounded-lg p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors cursor-pointer"
                                    title="Xác nhận nhập kho"
                                  >
                                    <CheckCircle size={15} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelImport(imp.importId);
                                    }}
                                    disabled={cancelImportMutation.isPending}
                                    className="rounded-lg p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                                    title="Hủy phiếu"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                </>
                              )}
                              {imp.status === 'CANCELLED' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImport(imp.importId);
                                  }}
                                  disabled={deleteImportMutation.isPending}
                                  className="rounded-lg p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                                  title="Xóa phiếu"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

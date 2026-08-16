import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../features/catalog/services/bookService';
import { useSaveGenrePreferences } from '../../features/user/hooks';

const DISMISS_KEY = 'dismissed_genre_onboarding';

export const GenreOnboardingModal: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const savePreferencesMutation = useSaveGenrePreferences();

  // Fetch list of genres
  const { data: genresData, isLoading: isLoadingGenres } = useQuery({
    queryKey: ['public', 'genres'],
    queryFn: async () => {
      const res = await bookService.getGenres();
      return res.data.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const genres = genresData || [];

  // Check if onboarding modal should be shown
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsOpen(false);
      return;
    }

    const isDismissed = sessionStorage.getItem(DISMISS_KEY) === 'true';
    if (!user.hasSelectedPreferences && !isDismissed) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, user]);

  const handleToggleGenre = (genreId: number) => {
    setErrorMessage(null);
    if (selectedGenreIds.includes(genreId)) {
      setSelectedGenreIds((prev) => prev.filter((id) => id !== genreId));
    } else {
      if (selectedGenreIds.length >= 5) {
        setErrorMessage('Bạn có thể chọn tối đa 5 thể loại');
        return;
      }
      setSelectedGenreIds((prev) => [...prev, genreId]);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, 'true');
    setIsOpen(false);
  };

  const handleSave = () => {
    if (selectedGenreIds.length < 1) {
      setErrorMessage('Vui lòng chọn ít nhất 1 thể loại yêu thích (khuyên dùng 3 thể loại)');
      return;
    }

    savePreferencesMutation.mutate(selectedGenreIds, {
      onSuccess: () => {
        setIsOpen(false);
      },
      onError: (err: any) => {
        setErrorMessage(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu sở thích');
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
            <span className="material-symbols-outlined text-[28px]">auto_stories</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Khám Phá Sách Theo Gu Của Bạn
          </h2>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-md mx-auto">
            Hãy chọn <strong className="text-primary font-semibold">3 thể loại sách</strong> bạn quan tâm nhất để hệ thống cá nhân hóa các gợi ý hấp dẫn dành riêng cho bạn!
          </p>

          {/* Selection counter badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-full text-xs font-semibold text-on-surface-variant">
            <span>Đã chọn:</span>
            <span
              className={`font-bold text-sm ${
                selectedGenreIds.length >= 3 ? 'text-primary' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {selectedGenreIds.length} / 3
            </span>
            {selectedGenreIds.length >= 3 && (
              <span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Genre Grid */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 min-h-[160px] max-h-[300px]">
          {isLoadingGenres ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-11 bg-surface-container-high animate-pulse rounded-xl" />
              ))}
            </div>
          ) : genres.length === 0 ? (
            <p className="text-center text-sm text-on-surface-variant py-8">
              Không thể tải danh sách thể loại sách.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {genres.map((genre) => {
                const isSelected = selectedGenreIds.includes(genre.genreId);
                return (
                  <button
                    key={genre.genreId}
                    type="button"
                    onClick={() => handleToggleGenre(genre.genreId)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.02]'
                        : 'bg-surface-container-low hover:bg-surface-container border-outline-variant/60 text-on-surface hover:border-primary/50'
                    }`}
                  >
                    <span className="line-clamp-1 flex-1 pr-1">{genre.name}</span>
                    <span
                      className={`material-symbols-outlined text-[18px] transition-transform ${
                        isSelected ? 'opacity-100 scale-110 text-white' : 'opacity-30'
                      }`}
                    >
                      {isSelected ? 'check_circle' : 'add_circle'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-outline-variant/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={savePreferencesMutation.isPending}
            className="px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
          >
            Để sau
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={selectedGenreIds.length === 0 || savePreferencesMutation.isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer ${
              selectedGenreIds.length > 0 && !savePreferencesMutation.isPending
                ? 'bg-primary hover:bg-primary-hover text-white shadow-primary/30 hover:scale-[1.02]'
                : 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed shadow-none'
            }`}
          >
            {savePreferencesMutation.isPending ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span>Khám phá ngay</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

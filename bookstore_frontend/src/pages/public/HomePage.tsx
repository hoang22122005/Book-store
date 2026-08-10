import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../../features/catalog/components/HeroBanner';
import { PersonalizedSection } from '../../features/catalog/components/PersonalizedSection';
import { CategoryGrid } from '../../features/catalog/components/CategoryGrid';
import { DiscountBanner } from '../../features/catalog/components/DiscountBanner';
import { CustomerReviewsSection } from '../../features/catalog/components/CustomerReviewsSection';
import { BenefitsSection } from '../../features/catalog/components/BenefitsSection';
import { BookListSection } from '../../features/book/components/BookListSection';
import { useBestsellerBooks, useHotBooks, useNewArrivalBooks } from '../../features/book/hooks';
import { useSectionPagination } from '../../hooks/useSectionPagination';
import { useAuth } from '../../hooks/useAuth';
import { useAddToCartMutation } from '../../features/cart';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const addToCartMutation = useAddToCartMutation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { page: bestsellerPage, goToPage: goToBestsellerPage } = useSectionPagination();
  const { page: hotPage, goToPage: goToHotPage } = useSectionPagination();
  const { page: newArrivalPage, goToPage: goToNewArrivalPage } = useSectionPagination();

  const { data: bestsellerData, isLoading: bestsellerLoading, isError: bestsellerError, isFetching: bestsellerFetching, refetch: refetchBestseller } = useBestsellerBooks(bestsellerPage, 4);
  const { data: hotData, isLoading: hotLoading, isError: hotError, isFetching: hotFetching, refetch: refetchHot } = useHotBooks(hotPage, 3);
  const { data: newArrivalData, isLoading: newArrivalLoading, isError: newArrivalError, isFetching: newArrivalFetching, refetch: refetchNewArrival } = useNewArrivalBooks(newArrivalPage, 4);

  const handleAddToCart = (id: string | number, qty: number = 1) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    addToCartMutation.mutate(Number(id), {
      onSuccess: () => {
        setToastMessage(`Đã thêm ${qty > 1 ? `${qty} ` : ''}sản phẩm vào giỏ hàng!`);
        setTimeout(() => setToastMessage(null), 3000);
      },
      onError: (error) => {
        setToastMessage('Lỗi khi thêm vào giỏ hàng: ' + (error as Error).message);
        setTimeout(() => setToastMessage(null), 3000);
      },
    });
  };

  return (
    <div className="space-y-stack-lg pb-stack-lg relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary text-on-secondary px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toastMessage}
        </div>
      )}

      <HeroBanner />
      <PersonalizedSection />
      <CategoryGrid />

      <BookListSection
        title="Sách bán chạy"
        data={bestsellerData}
        isLoading={bestsellerLoading}
        isError={bestsellerError}
        isFetching={bestsellerFetching}
        refetch={refetchBestseller}
        onAddToCart={handleAddToCart}
        columns={4}
        emptyMessage="Chưa có sách bán chạy nào được cập nhật."
        errorMessage="Không thể tải danh sách sách bán chạy từ hệ thống."
        onPageChange={goToBestsellerPage}
        externalPage={bestsellerPage}
      />

      <BookListSection
        title="Sách Hot tuần này"
        data={hotData}
        isLoading={hotLoading}
        isError={hotError}
        isFetching={hotFetching}
        refetch={refetchHot}
        columns={3}
        emptyMessage="Chưa có dữ liệu sách hot trong tuần này."
        errorMessage="Không thể tải danh sách sách hot từ hệ thống."
        onPageChange={goToHotPage}
        externalPage={hotPage}
      />

      <DiscountBanner />

      <BookListSection
        title="Sách mới phát hành"
        data={newArrivalData}
        isLoading={newArrivalLoading}
        isError={newArrivalError}
        isFetching={newArrivalFetching}
        refetch={refetchNewArrival}
        onAddToCart={handleAddToCart}
        columns={4}
        emptyMessage="Chưa có sách mới phát hành nào."
        errorMessage="Không thể tải danh sách sách mới từ hệ thống."
        onPageChange={goToNewArrivalPage}
        externalPage={newArrivalPage}
      />

      <CustomerReviewsSection />
      <BenefitsSection />
    </div>
  );
};

export default HomePage;

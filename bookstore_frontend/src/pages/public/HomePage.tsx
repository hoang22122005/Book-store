import React, { useCallback } from 'react';
import { HeroBanner } from '../../features/catalog/components/HeroBanner';
import { PersonalizedSection } from '../../features/catalog/components/PersonalizedSection';
import { CategoryGrid } from '../../features/catalog/components/CategoryGrid';
import { DiscountBanner } from '../../features/catalog/components/DiscountBanner';
import { CustomerReviewsSection } from '../../features/catalog/components/CustomerReviewsSection';
import { BenefitsSection } from '../../features/catalog/components/BenefitsSection';
import { BookListSection } from '../../features/book/components/BookListSection';
import { useBestsellerBooks, useHotBooks, useNewArrivalBooks } from '../../features/book/hooks';
import { useSectionPagination } from '../../hooks/useSectionPagination';

export const HomePage: React.FC = () => {
  const { page: bestsellerPage, goToPage: goToBestsellerPage } = useSectionPagination();
  const { page: hotPage, goToPage: goToHotPage } = useSectionPagination();
  const { page: newArrivalPage, goToPage: goToNewArrivalPage } = useSectionPagination();

  const { data: bestsellerData, isLoading: bestsellerLoading, isError: bestsellerError, isFetching: bestsellerFetching, refetch: refetchBestseller } = useBestsellerBooks(bestsellerPage, 4);
  const { data: hotData, isLoading: hotLoading, isError: hotError, isFetching: hotFetching, refetch: refetchHot } = useHotBooks(hotPage, 3);
  const { data: newArrivalData, isLoading: newArrivalLoading, isError: newArrivalError, isFetching: newArrivalFetching, refetch: refetchNewArrival } = useNewArrivalBooks(newArrivalPage, 4);

  const handleAddToCart = useCallback((id: number) => {
    console.log('Added book to cart:', id);
  }, []);

  return (
    <div className="space-y-stack-lg pb-stack-lg">
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Personalized Recommendations Section */}
      <PersonalizedSection />

      {/* 3. Featured Categories Section */}
      <CategoryGrid />

      {/* 4. Best-selling Books Component (REST API hook) */}
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

      {/* 5. Hot Books of the Week Section */}
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

      {/* 6. Special Discount Banner Section */}
      <DiscountBanner />

      {/* 7. New Arrival Books Component (REST API hook) */}
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

      {/* 8. Customer Reviews Section */}
      <CustomerReviewsSection />

      {/* 9. Customer Benefits Section */}
      <BenefitsSection />
    </div>
  );
};

export default HomePage;

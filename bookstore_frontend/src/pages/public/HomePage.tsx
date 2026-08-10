import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroBanner } from '../../features/catalog/components/HeroBanner';
import { PersonalizedSection } from '../../features/catalog/components/PersonalizedSection';
import { CategoryGrid } from '../../features/catalog/components/CategoryGrid';
import { BestsellerBooksSection } from '../../features/catalog/components/BestsellerBooksSection';
import { HotBooksSection } from '../../features/catalog/components/HotBooksSection';
import { DiscountBanner } from '../../features/catalog/components/DiscountBanner';
import { NewArrivalsSection } from '../../features/catalog/components/NewArrivalsSection';
import { CustomerReviewsSection } from '../../features/catalog/components/CustomerReviewsSection';
import { BenefitsSection } from '../../features/catalog/components/BenefitsSection';
import { useAuth } from '../../hooks/useAuth';
import { useAddToCartMutation } from '../../features/cart';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const addToCartMutation = useAddToCartMutation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-secondary text-on-secondary px-4 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Personalized Recommendations Section */}
      <PersonalizedSection />

      {/* 3. Featured Categories Section */}
      <CategoryGrid />

      {/* 4. Best-selling Books Component (REST API hook) */}
      <BestsellerBooksSection onAddToCart={handleAddToCart} />

      {/* 5. Hot Books of the Week Section */}
      <HotBooksSection />

      {/* 6. Special Discount Banner Section */}
      <DiscountBanner />

      {/* 7. New Arrival Books Component (REST API hook) */}
      <NewArrivalsSection onAddToCart={handleAddToCart} />

      {/* 8. Customer Reviews Section */}
      <CustomerReviewsSection />

      {/* 9. Customer Benefits Section */}
      <BenefitsSection />

    </div>
  );
};

export default HomePage;

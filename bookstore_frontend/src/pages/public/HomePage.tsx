import React from 'react';
import { HeroBanner } from '../../features/catalog/components/HeroBanner';
import { PersonalizedSection } from '../../features/catalog/components/PersonalizedSection';
import { CategoryGrid } from '../../features/catalog/components/CategoryGrid';
import { BestsellerBooksSection } from '../../features/catalog/components/BestsellerBooksSection';
import { HotBooksSection } from '../../features/catalog/components/HotBooksSection';
import { DiscountBanner } from '../../features/catalog/components/DiscountBanner';
import { NewArrivalsSection } from '../../features/catalog/components/NewArrivalsSection';
import { CustomerReviewsSection } from '../../features/catalog/components/CustomerReviewsSection';
import { BenefitsSection } from '../../features/catalog/components/BenefitsSection';

export const HomePage: React.FC = () => {
  const handleAddToCart = (id: string | number) => {
    console.log('Added book to cart:', id);
  };

  return (
    <div className="space-y-stack-lg pb-stack-lg">
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

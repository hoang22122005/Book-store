import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ChatWidget } from '../components/common/ChatWidget';
import { GenreOnboardingModal } from '../components/common/GenreOnboardingModal';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md antialiased pt-20">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <GenreOnboardingModal />
    </div>
  );
};

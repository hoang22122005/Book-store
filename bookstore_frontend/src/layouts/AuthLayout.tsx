import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative overflow-hidden my-auto">
        {/* Abstract Background Decoration from Stitch */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#d6e3ff] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#ffddb8] rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>

        <div className="w-full max-w-5xl flex justify-center relative z-10">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

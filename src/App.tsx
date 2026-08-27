import React from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { HomePage } from './pages/HomePage.js';
import { ProductsCatalogPage } from './pages/ProductsCatalogPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { ComparePage } from './pages/ComparePage.js';
import { OffersPage } from './pages/OffersPage.js';
import { ReviewsPage } from './pages/ReviewsPage.js';
import { CreatorsPage } from './pages/CreatorsPage.js';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage.js';
import { AdminPanelPage } from './pages/AdminPanelPage.js';
import { MyAccountPage } from './pages/MyAccountPage.js';
import { LegalPages } from './pages/LegalPages.js';

const MainRouter: React.FC = () => {
  const { currentPage, pageParams } = useApp();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;

      case 'products':
        return (
          <ProductsCatalogPage 
            initialCategory={pageParams?.category}
            initialSearch={pageParams?.search}
            initialSort={pageParams?.sort}
          />
        );

      case 'product-detail':
        return <ProductDetailPage slug={pageParams?.slug || 'rtx-4060-8gb-galax'} />;

      case 'compare':
        return <ComparePage initialProductIds={pageParams?.productIds} />;

      case 'offers':
        return <OffersPage />;

      case 'reviews':
        return <ReviewsPage />;

      case 'creators':
        return <CreatorsPage />;

      case 'creator-dashboard':
        return (
          <CreatorDashboardPage 
            initialTab={pageParams?.tab} 
            productId={pageParams?.productId} 
          />
        );

      case 'admin-panel':
        return <AdminPanelPage />;

      case 'my-account':
        return <MyAccountPage initialTab={pageParams?.tab} />;

      case 'legal':
        return <LegalPages doc={pageParams?.doc} />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F1F3] text-zinc-950 flex flex-col font-sans selection:bg-[#D4FF59] selection:text-black">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {renderCurrentPage()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewsAnalysisPage } from './pages/NewsAnalysisPage';
import { ClaimVerificationPage } from './pages/ClaimVerificationPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalysisDetailsPage } from './pages/AnalysisDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  // Sync with browser hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        setCurrentPage('landing');
        setPageParams({});
        return;
      }

      const [route, queryStr] = hash.split('?');
      const params: Record<string, string> = {};
      if (queryStr) {
        const searchParams = new URLSearchParams(queryStr);
        searchParams.forEach((val, key) => {
          params[key] = val;
        });
      }

      setCurrentPage(route || 'landing');
      setPageParams(params);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    let hashUrl = `#${page}`;
    const keys = Object.keys(params);
    if (keys.length > 0) {
      const q = new URLSearchParams(params).toString();
      hashUrl += `?${q}`;
    }
    window.location.hash = hashUrl;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      <Navbar currentPage={currentPage} onNavigate={navigateTo} />

      <main className="flex-1 flex flex-col">
        {currentPage === 'landing' && <LandingPage onNavigate={navigateTo} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigateTo} />}
        {currentPage === 'register' && <RegisterPage onNavigate={navigateTo} />}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={navigateTo} />}
        {currentPage === 'analysis' && <NewsAnalysisPage initialParams={pageParams} onNavigate={navigateTo} />}
        {currentPage === 'claims' && <ClaimVerificationPage onNavigate={navigateTo} />}
        {currentPage === 'history' && <HistoryPage onNavigate={navigateTo} />}
        {currentPage === 'details' && <AnalysisDetailsPage id={pageParams.id} onNavigate={navigateTo} />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'admin' && <AdminDashboardPage onNavigate={navigateTo} />}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

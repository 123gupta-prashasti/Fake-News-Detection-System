import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, isAuthenticated, isAdmin, logout, quickLoginAsDemo } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-lg font-bold tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-cyan-500 to-blue-600 inline-block"></span>
          <span>NewsVerify</span>
        </button>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('analysis')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentPage === 'analysis' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : 'hover:text-white'
            }`}
          >
            News Analysis
          </button>
          
          <button
            onClick={() => onNavigate('claims')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentPage === 'claims' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : 'hover:text-white'
            }`}
          >
            Claim Verification
          </button>

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentPage === 'dashboard' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : 'hover:text-white'
              }`}
            >
              Dashboard
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('history')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentPage === 'history' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : 'hover:text-white'
              }`}
            >
              History
            </button>
          )}

          <button
            onClick={() => onNavigate('about')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentPage === 'about' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : 'hover:text-white'
            }`}
          >
            About & Methodology
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                currentPage === 'admin' ? 'text-amber-400 font-semibold border-b-2 border-amber-400' : 'text-amber-400/90 hover:text-amber-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action / Authentication */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">{user?.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => quickLoginAsDemo('analyst')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 rounded-md hover:bg-cyan-900/50 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Analyst</span>
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-500 transition-colors whitespace-nowrap shadow-sm shadow-sky-900/40"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-semibold text-slate-200">NewsVerify</span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span>Final Year B.Tech Computer Science Project</span>
          <span className="hidden sm:inline text-slate-600">·</span>
          <span className="text-slate-400">TF-IDF & Logistic Regression XAI Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('about')}
            className="hover:text-cyan-400 transition-colors"
          >
            Methodology & Thesis
          </button>
          <button
            onClick={() => onNavigate('analysis')}
            className="hover:text-cyan-400 transition-colors"
          >
            Analyze News
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-200 transition-colors"
          >
            Source Repository
          </a>
        </div>
      </div>
    </footer>
  );
};

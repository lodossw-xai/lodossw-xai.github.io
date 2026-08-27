/**
 * Legal Page - Privacy Policy and Terms of Service
 * Uses shared Navigation and Footer components
 */
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navigation from '../components/layout/Navigation';
import { getLocalizedData, legalData } from '../data';
import useLanguageStore from '../store/languageStore';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

function LegalPage({ type }: LegalPageProps): ReactElement {
  const { language } = useLanguageStore();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return document.documentElement.classList.contains('dark');
  });

  const legalContent = getLocalizedData(legalData, language);
  const content = legalContent[type];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const handleDarkModeToggle = (): void => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      {/* Navigation */}
      <Navigation
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleDarkModeToggle}
      />

      {/* Content */}
      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
              {content.title}
            </h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                {content.content}
              </p>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-ai-blue font-bold hover:gap-3 transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                {language === 'ko' ? '홈으로 돌아가기' : 'Return to Home'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LegalPage;

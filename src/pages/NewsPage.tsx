import type { ReactElement } from 'react';
import { useState } from 'react';
import Footer from '../components/layout/Footer';
import Navigation from '../components/layout/Navigation';
import newsData from '../data/news.json';
import useLanguageStore from '../store/languageStore';

function NewsPage(): ReactElement {
  const { language } = useLanguageStore();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const handleDarkModeToggle = (): void => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B1120] text-gray-900 dark:text-gray-100">
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleDarkModeToggle} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header Title */}
        <div className="mb-16 text-center">
          <span className="text-ai-blue text-sm font-bold tracking-widest uppercase mb-4 block">
            PRESS & NEWS
          </span>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-ai-blue to-ai-green">
            {language === 'ko' ? '언론 보도자료' : 'Press Releases'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'ko'
              ? 'XAI Korea의 공신력 있는 언론 보도 소식들을 모아서 전해드립니다.'
              : 'Collection of authoritative press releases from XAI Korea.'}
          </p>
        </div>

        {/* News Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {newsData.map((news) => (
            <a
              key={news.id}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:border-ai-blue/40 hover:shadow-2xl hover:shadow-blue-500/5 transition duration-300"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={news.thumbnail}
                  alt={news.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-ai-blue text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {news.publisher}
                </div>
              </div>

              {/* Text Content */}
              <div className="p-6">
                <span className="text-xs text-gray-400 dark:text-gray-500 block mb-2">{news.date}</span>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-ai-blue transition-colors duration-200 line-clamp-2 leading-snug">
                  {news.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed keep-all">
                  {news.summary}
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-ai-blue group-hover:translate-x-1 transition-transform">
                  {language === 'ko' ? '기사 원문 보기' : 'View Full Article'} <span className="material-symbols-outlined text-xs ml-1">arrow_forward</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NewsPage;

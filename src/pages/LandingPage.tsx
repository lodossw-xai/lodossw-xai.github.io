/**
 * Landing Page - XAI Korea One Page Template
 * Constitution I: Functional Component
 * Based on html/code.html design
 */
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import Toast from '../components/common/Toast';
import ContactSection from '../components/layout/ContactSection';
import Footer from '../components/layout/Footer';
import Navigation from '../components/layout/Navigation';
import partnersData from '../data/partners.json';
import historyData from '../data/history.json';
import { useLocalizedData } from '../hooks/useLocalizedData';
import useLanguageStore from '../store/languageStore';

function LandingPage(): ReactElement {
  const { language } = useLanguageStore();
  const data = useLocalizedData();

  // Initialize dark mode state from current DOM state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  // State for toast notification
  const [toast, setToast] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const showNotification = (message: string) => {
    setToast({ isOpen: true, message });
  };

  // Sync with system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent): void => {
      // Only auto-switch if no user preference is stored
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Dark mode toggle handler
  const handleDarkModeToggle = (): void => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleDarkModeToggle}
      />

      {/* Hero Section */}
      <section
        className="min-h-screen relative flex items-center pt-28 pb-32 md:pt-20 md:pb-0 overflow-hidden bg-white dark:bg-[#0B1120] group"
        id="home"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-tech-grid dark:bg-tech-grid-dark bg-[length:50px_50px] animate-flow-grid opacity-40"></div>
          <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-ai-blue/10 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div
            className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-ai-green/10 rounded-full blur-[100px] animate-pulse-slow"
            style={{ animationDelay: '2s' }}
          ></div>
          {/* Particles */}
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-ai-blue rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-particle-drift group-hover:duration-[8s]"></div>
          <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-ai-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-particle-drift-delayed group-hover:duration-[8s]"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-ai-blue rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)] animate-particle-drift"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-particle-drift"
            style={{ animationDelay: '4s' }}
          ></div>
        </div>

        {/* Interactive Grid - Desktop only */}
        <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 z-0 pointer-events-auto opacity-0 md:opacity-100">
          {Array.from({ length: 72 }).map((_, i) => (
            <div
              key={i}
              className={`hover-grid-cell ${i >= 36 ? 'hidden md:block' : ''}`}
            ></div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full z-10 pointer-events-none">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center pointer-events-auto">
            <div className="mb-12 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ai-blue/10 border border-ai-blue/30 backdrop-blur-sm text-ai-blue dark:text-blue-300 text-sm font-semibold mb-6">
                <span className="material-symbols-outlined text-sm animate-pulse">
                  hub
                </span>
                <span>{data.hero.badge}</span>
              </div>

              <h1 className="font-display font-extrabold text-5xl lg:text-7xl text-gray-900 dark:text-white leading-tight mb-8">
                {data.hero.title.line1}
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-ai-blue to-ai-green">
                    {data.hero.title.line2}
                  </span>
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed keep-all">
                {data.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-black font-bold text-lg py-4 px-8 rounded-lg transition shadow-xl shadow-yellow-500/20 group"
                  href="#contact"
                >
                  {data.hero.cta.primary}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition">
                    arrow_forward
                  </span>
                </a>
                <a
                  className="flex items-center justify-center gap-2 bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-ai-blue dark:hover:border-ai-blue text-gray-900 dark:text-white font-semibold text-lg py-4 px-8 rounded-lg transition cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    showNotification(
                      data.language === 'ko' ? '준비중입니다.' : 'Coming soon.'
                    );
                  }}
                  href="#"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  {data.hero.cta.secondary}
                </a>
              </div>

              {/* GitHub & Hugging Face Links - Terminal Style */}
              <div className="flex flex-wrap items-center gap-6 mt-6 font-mono text-sm">
                <a
                  href="https://github.com/xaikorea"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition group"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="group-hover:underline">xaikorea</span>
                </a>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <a
                  href="https://huggingface.co/datasets/xaikorea0/taxia-korean-tax-laws"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition group"
                >
                  <span className="grayscale group-hover:grayscale-0 transition">
                    🤗
                  </span>
                  <span className="group-hover:underline">
                    taxia-korean-tax-laws
                  </span>
                </a>
              </div>
            </div>

            {/* Demo Card */}
            <div className="relative z-10 flex justify-center lg:justify-end h-full">
              <div className="relative w-full max-w-lg">
                <div className="relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/40 dark:border-slate-700/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/10 animate-float transition-all duration-500 hover:scale-[1.02] hover:shadow-blue-500/20">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-ai-blue/30 via-transparent to-ai-green/30 blur-xl opacity-40 dark:opacity-20"></div>

                  <div className="relative">
                    {/* Window Controls */}
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100/80 dark:border-slate-800 pb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-6">
                      {/* User Message */}
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full flex-shrink-0 flex items-center justify-center shadow-inner">
                          <span className="material-symbols-outlined text-gray-500">
                            person
                          </span>
                        </div>
                        <div className="bg-gray-100/90 dark:bg-slate-800/80 p-4 rounded-2xl rounded-tl-none flex-1 shadow-sm">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                            2024년 개정된 조특법상 R&D 세액공제 적용 요건이
                            어떻게 되나요?
                          </p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex gap-4 flex-row-reverse">
                        <div className="w-10 h-10 bg-gradient-to-br from-ai-blue to-ai-green rounded-full flex-shrink-0 flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <span className="material-symbols-outlined text-white">
                            smart_toy
                          </span>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50/90 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10 border border-blue-100/70 dark:border-blue-800/30 p-4 rounded-2xl rounded-tr-none flex-1 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-1.5 w-1.5 bg-ai-green rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-ai-blue dark:text-blue-300 uppercase">
                              AI Analysis
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-3 font-display">
                            조세특례제한법 제10조 개정안에 따라 신성장·원천기술
                            관련 비용 인정 범위가 확대되었습니다...
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded border border-gray-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">
                                link
                              </span>{' '}
                              국세청 고시
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accuracy Badge */}
                <div className="absolute -right-6 top-1/2 bg-white/95 dark:bg-slate-800/95 backdrop-blur border border-gray-200 dark:border-gray-600 p-3 rounded-xl shadow-xl animate-float-delayed flex items-center gap-3 z-20">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                      verified
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      정확도 (Accuracy)
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      99.9%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <a
          href="#services"
          className="absolute bottom-1 md:bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce opacity-50 hover:opacity-100 transition-opacity z-20 cursor-pointer"
        >
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            SCROLL DOWN
          </span>
          <span className="material-symbols-outlined text-gray-400 dark:text-gray-600">
            keyboard_arrow_down
          </span>
        </a>
      </section>

      {/* Services Section */}
      <section
        className="py-24 bg-surface-light dark:bg-background-dark"
        id="services"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white mb-6 leading-snug reveal-text">
              <span className="text-ai-blue">
                {data.services.title.highlight}
              </span>
              <span
                dangerouslySetInnerHTML={{ __html: data.services.title.main }}
              />
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg keep-all">
              {data.services.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.services.cards.map((card, index) => (
              <div
                key={index}
                className={`interactive-card p-8 rounded-2xl transition group h-full ${
                  card.isPopular
                    ? 'bg-gradient-to-br from-white to-gray-50 dark:from-surface-dark dark:to-black border-2 border-primary shadow-xl relative overflow-hidden'
                    : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 hover:border-primary dark:hover:border-primary'
                }`}
              >
                {card.isPopular && card.badge && (
                  <div className="absolute top-0 right-0 bg-primary text-xs font-bold px-3 py-1 rounded-bl-lg text-black">
                    {card.badge}
                  </div>
                )}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                    card.isPopular
                      ? 'bg-black dark:bg-gray-800'
                      : 'bg-primary/20 dark:bg-primary/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed keep-all">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline Section */}
      <section className="py-24 bg-white dark:bg-surface-dark/30 relative overflow-hidden" id="history">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-ai-blue text-sm font-bold tracking-widest uppercase mb-4 block">
              {language === 'ko' ? '연혁 및 로드맵' : 'HISTORY & ROADMAP'}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">
              {language === 'ko' ? 'XAI Korea가 걸어온 길' : 'Our Journey'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {language === 'ko'
                ? 'AI 기반 규제 기술(RegTech) 시장의 혁신을 이끄는 저희의 발자취와 미래 비전입니다.'
                : 'Our footprints and future vision leading the innovation of AI-based RegTech.'}
            </p>
          </div>

          {/* 세로 타임라인 라인 */}
          <div className="relative wrap overflow-hidden p-4 md:p-10 h-full">
            <div className="border-2-2 absolute border-opacity-20 border-ai-blue h-full border left-4 md:left-1/2"></div>
            
            {historyData.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div key={index} className={`mb-8 flex justify-between items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''} flex-col md:flex-row relative`}>
                  {/* 데스크톱 빈 공간 채우기 */}
                  <div className="order-1 md:w-5/12 hidden md:block"></div>
                  
                  {/* 중앙 포인트 도트 */}
                  <div className="z-20 flex items-center order-1 bg-ai-blue shadow-xl w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white dark:border-slate-900 absolute left-1 md:relative md:left-auto">
                  </div>
                  
                  {/* 마일스톤 카드 */}
                  <div className="order-1 bg-slate-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-2xl w-full md:w-5/12 ml-8 md:ml-0 px-6 py-6 shadow-sm hover:border-ai-blue/40 transition duration-300">
                    <span className="text-ai-blue font-bold text-xs md:text-sm block mb-1">{item.date}</span>
                    <h4 className="mb-2 font-bold text-base md:text-lg text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs md:text-sm leading-relaxed text-gray-600 dark:text-gray-400 keep-all">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Steps & Accuracy Section */}
      <section className="py-24 bg-white dark:bg-surface-dark/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Process Steps */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="bg-primary rounded-3xl p-1 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.1)] transform rotate-1 hover:rotate-0 transition duration-500">
                <img
                  alt="Accountant analyzing data"
                  className="w-full rounded-2xl grayscale hover:grayscale-0 transition duration-500"
                  src="/assets/images/main/processing_01.png"
                />
              </div>
            </div>

            <div className="lg:w-1/2 order-1 lg:order-2">
              <div className="inline-block p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
                <span className="material-symbols-outlined text-yellow-700 dark:text-yellow-400 text-3xl">
                  psychology
                </span>
              </div>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white mb-6 leading-tight reveal-text">
                {data.services.process.title.line1}
                <br />
                {data.services.process.title.line2}
                <span className="text-ai-green">
                  {data.services.process.title.highlight}
                </span>
                {data.services.process.title.line3}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 keep-all">
                {data.services.process.description}
              </p>

              <ul className="space-y-6">
                {data.services.process.steps.map((step, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-6 p-4 rounded-xl ${
                      index === 1
                        ? 'bg-primary shadow-xl transform translate-x-4'
                        : 'bg-surface-light dark:bg-background-dark border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 1
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        index === 1
                          ? 'text-black'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {step}
                    </span>
                    {index === 1 && (
                      <span className="ml-auto material-symbols-outlined text-black">
                        arrow_forward
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Accuracy Section */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white mb-6 leading-tight reveal-text">
                {data.services.accuracy.title.line1}
                <br />
                <span className="text-ai-blue">
                  {data.services.accuracy.title.highlight}
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 keep-all">
                {data.services.accuracy.description}
              </p>

              <div className="space-y-6">
                {data.services.accuracy.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                      <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">
                        {feature.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 relative w-full">
              <div className="bg-white dark:bg-background-dark border-2 border-gray-900 dark:border-gray-600 rounded-2xl p-8 relative shadow-[12px_12px_0px_0px_#FFD700]">
                <div className="absolute -top-6 -right-6 text-6xl animate-bounce">
                  ✨
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse delay-75"></div>
                  <div className="h-20 bg-primary/20 rounded-xl border border-primary flex items-center justify-center">
                    <span className="text-primary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin">
                        sync
                      </span>
                      {data.services.accuracy.processing}
                    </span>
                  </div>
                  <div className="col-span-2 h-32 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                    <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                    <div className="w-1/2 h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
                <img
                  alt="Data processing"
                  className="absolute -bottom-10 -left-10 w-40 h-40 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                  src="/assets/images/main/processing.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        className="py-24 bg-surface-light dark:bg-background-dark"
        id="team"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="text-ai-blue text-sm font-bold tracking-widest uppercase mb-4 block">
              {data.team.badge}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
              {data.team.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {data.team.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {data.team.members.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-surface-dark rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <img
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500 border-4 border-gray-100 dark:border-gray-700"
                    src={member.image}
                  />
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-ai-blue text-sm font-semibold uppercase tracking-wide mb-4">
                  {member.role}
                </p>
                <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed space-y-1">
                  {member.bio.map((line, bioIndex) => (
                    <p key={bioIndex}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisors Section - Rolling Banner */}
      <section
        className="py-24 bg-surface-light dark:bg-background-dark border-y border-gray-200 dark:border-gray-800 overflow-hidden"
        id="advisors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white mb-16 reveal-text">
            <span className="text-ai-blue">
              {data.advisors.title.highlight}
            </span>
            {data.advisors.title.main}
          </h2>
        </div>

        {/* Rolling Banner Container */}
        <div className="relative">
          {/* Gradient Overlay - Left */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-surface-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>
          {/* Gradient Overlay - Right */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-surface-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Track */}
          <div className="flex gap-6 scroll-track">
            {/* Original Cards + Duplicates for seamless loop */}
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex gap-6">
                {data.advisors.items.map((advisor, index) => (
                  <div
                    key={index}
                    className="w-[220px] shrink-0 bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative hover:shadow-lg hover:border-primary dark:hover:border-primary transition-all duration-300 group"
                  >
                    {advisor.isHead && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-black px-3 py-0.5 text-[10px] font-bold rounded-full shadow-md whitespace-nowrap">
                        HEAD ADVISOR
                      </div>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <img
                        alt={advisor.name}
                        className="w-20 h-20 rounded-full object-cover ring-3 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary mb-4 transition-all duration-300"
                        src={advisor.image}
                      />
                      <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                        {advisor.name}
                      </h4>
                      <p
                        className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium"
                        dangerouslySetInnerHTML={{ __html: advisor.role }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-yellow-50 dark:bg-yellow-900/10 border-y border-yellow-100 dark:border-yellow-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-gray-900 dark:text-white mb-6 leading-tight reveal-text">
            {data.navigation.cta.title.line1}
            <span className="text-ai-blue">
              {data.navigation.cta.title.highlight}
            </span>
            {data.navigation.cta.title.line2}
            <br />
            {data.navigation.cta.title.line3}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-12">
            {data.navigation.cta.description}
          </p>

          <div className="bg-primary rounded-2xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="relative z-10 text-left">
              <h3 className="font-bold text-2xl text-black mb-2">
                {data.navigation.cta.enterprise.title}
              </h3>
              <p className="text-black/80 font-medium">
                {data.navigation.cta.enterprise.description}
              </p>
            </div>
            <div className="relative z-10 w-full md:w-auto">
              <a
                className="block text-center bg-black hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-xl transition border border-transparent hover:border-gray-600 shadow-lg"
                href="#contact"
              >
                {data.navigation.cta.enterprise.button}
              </a>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transform group-hover:scale-110 transition duration-700">
              <span className="material-symbols-outlined text-9xl text-black">
                rocket_launch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-surface-light dark:bg-background-dark/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-extrabold text-3xl text-center text-gray-900 dark:text-white mb-16 reveal-text">
            {data.faq.title.text}
            <span className="text-ai-blue ml-2">{data.faq.title.highlight}</span>
          </h2>

          <div className="space-y-4">
            {data.faq.items.map((item, index) => (
              <details
                key={index}
                className="group bg-white dark:bg-surface-dark/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800/80 shadow-sm transition-all duration-300 hover:border-ai-blue/30"
              >
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none select-none">
                  <span className="font-bold text-lg text-gray-800 dark:text-gray-200 group-open:text-ai-blue transition-colors duration-200">
                    {item.question}
                  </span>
                  <span className="transition-transform duration-300 group-open:rotate-180 bg-gray-50 dark:bg-slate-800 rounded-full p-1 border border-gray-200/50 dark:border-slate-700/50">
                    <span className="material-symbols-outlined text-gray-500 group-open:text-ai-blue">
                      keyboard_arrow_down
                    </span>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-slate-800/50 pt-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section - Rolling Banner */}
      <section className="py-12 bg-white dark:bg-black/40 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            업계 최고의 파트너들과 함께합니다
          </p>
        </div> */}
        <div className="relative">
          {/* Gradient Overlay - Left */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white dark:from-[#0B1120] to-transparent z-10 pointer-events-none"></div>
          {/* Gradient Overlay - Right */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white dark:from-[#0B1120] to-transparent z-10 pointer-events-none"></div>

          {/* Partners List */}
          {(() => {
            return (
              <div className="flex gap-16 scroll-track-3">
                {[...Array(3)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-16 items-center">
                    {partnersData.map((partner, pIndex) => (
                      <a
                        key={`${setIndex}-${pIndex}`}
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex shrink-0 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 ${
                          partner.mark
                            ? 'flex-col items-center gap-1'
                            : 'items-center justify-center'
                        }`}
                        title={partner.name}
                      >
                        {partner.mark ? (
                          <>
                            <img
                              src={partner.mark}
                              alt={partner.name}
                              className="h-10 w-auto object-contain"
                            />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {partner.name}
                            </span>
                          </>
                        ) : (
                          <img
                            src={partner.image}
                            alt={partner.name}
                            className="h-16 w-auto object-contain"
                          />
                        )}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default LandingPage;

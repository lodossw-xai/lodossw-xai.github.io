/**
 * Navigation Component
 * Shared navigation bar for all pages
 */
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLocalizedData } from '../../../hooks/useLocalizedData';
import useLanguageStore from '../../../store/languageStore';

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

function Navigation({
  isDarkMode,
  onToggleDarkMode,
}: NavigationProps): ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const data = useLocalizedData();
  const location = useLocation();

  // Determine if we're on the landing page
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="fixed w-full z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link
            to="/"
            className="shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <img
              src="/assets/images/logo/logo-light.png"
              alt="XAI Korea Logo"
              className="h-12 w-auto dark:hidden"
            />
            <img
              src="/assets/images/logo/logo-dark.png"
              alt="XAI Korea Logo"
              className="h-12 w-auto hidden dark:block"
            />
            <span className="font-display font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              XAI <span className="text-primary">Korea</span>
            </span>
          </Link>

          <div className="hidden md:flex space-x-8 items-center">
            {isLandingPage ? (
              <>
                <a
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  href="#home"
                >
                  {data.navigation.nav.home}
                </a>
                <a
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  href="#services"
                >
                  {data.navigation.nav.services}
                </a>
                <a
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  href="#team"
                >
                  {data.navigation.nav.team}
                </a>
                <a
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  href="#advisors"
                >
                  {data.navigation.nav.advisors}
                </a>
                <Link
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  to="/board"
                >
                  게시판
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  to="/#home"
                >
                  {data.navigation.nav.home}
                </Link>
                <Link
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  to="/#services"
                >
                  {data.navigation.nav.services}
                </Link>
                <Link
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  to="/#team"
                >
                  {data.navigation.nav.team}
                </Link>
                <Link
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  to="/#advisors"
                >
                  {data.navigation.nav.advisors}
                </Link>
                <Link
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition"
                  to="/board"
                >
                  게시판
                </Link>
              </>
            )}

            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full px-1 py-1">
              <button
                className={`px-3 py-1 text-xs font-bold transition ${
                  language === 'en'
                    ? 'bg-gray-900 text-white rounded-full'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                className={`px-3 py-1 text-xs font-bold transition ${
                  language === 'ko'
                    ? 'bg-gray-900 text-white rounded-full'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                onClick={() => setLanguage('ko')}
              >
                KR
              </button>
            </div>

            <a
              className="bg-primary hover:bg-primary-hover text-black font-bold py-2.5 px-6 rounded-lg transition shadow-lg shadow-yellow-500/20"
              href="#contact"
            >
              {data.navigation.nav.contact}
            </a>

            <button
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              onClick={onToggleDarkMode}
              aria-label={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              <span className="material-symbols-outlined">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              className="text-gray-500 hover:text-gray-900 dark:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {isLandingPage ? (
            <>
              <a
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.home}
              </a>
              <a
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.services}
              </a>
              <a
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                href="#team"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.team}
              </a>
              <a
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                href="#advisors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.advisors}
              </a>
              <Link
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                to="/board"
                onClick={() => setMobileMenuOpen(false)}
              >
                게시판
              </Link>
            </>
          ) : (
            <>
              <Link
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                to="/#home"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.home}
              </Link>
              <Link
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                to="/#services"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.services}
              </Link>
              <Link
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                to="/#team"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.team}
              </Link>
              <Link
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                to="/#advisors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {data.navigation.nav.advisors}
              </Link>
              <Link
                className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-primary font-medium transition py-2"
                to="/board"
                onClick={() => setMobileMenuOpen(false)}
              >
                게시판
              </Link>
            </>
          )}

          <div className="flex items-center justify-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-full px-1 py-1">
              <button
                className={`px-3 py-1 text-xs font-bold transition ${
                  language === 'en'
                    ? 'bg-gray-900 text-white rounded-full'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                className={`px-3 py-1 text-xs font-bold transition ${
                  language === 'ko'
                    ? 'bg-gray-900 text-white rounded-full'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
                onClick={() => setLanguage('ko')}
              >
                KR
              </button>
            </div>

            <button
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              onClick={onToggleDarkMode}
              aria-label={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              <span className="material-symbols-outlined">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          <a
            className="block text-center bg-primary hover:bg-primary-hover text-black font-bold py-3 px-6 rounded-lg transition shadow-lg shadow-yellow-500/20"
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
          >
            {data.navigation.nav.contact}
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

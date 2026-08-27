/**
 * Footer Component
 * Shared footer for all pages
 */
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useLocalizedData } from '../../../hooks/useLocalizedData';

function Footer(): ReactElement {
  const data = useLocalizedData();

  return (
    <footer className="bg-hero-dark text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/images/logo/logo-dark.png"
                alt="XAIKOREA Logo"
                className="h-10 w-auto"
              />
              <span className="font-display font-bold text-xl tracking-tight">
                {data.footer.logo.name}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed whitespace-pre-line">
              {data.footer.tagline}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3">
              <a
                href="https://github.com/xaikorea"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
                title="GitHub"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://huggingface.co/datasets/xaikorea0/taxia-korean-tax-laws"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition group"
                title="Hugging Face"
              >
                <span className="text-lg grayscale group-hover:grayscale-0 transition">
                  🤗
                </span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
              >
                <span className="text-gray-400 text-sm">
                  {data.footer.social.linkedin}
                </span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition"
              >
                <span className="text-gray-400 text-sm">
                  {data.footer.social.twitter}
                </span>
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">
              {data.footer.menus.company.title}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {data.footer.menus.company.items.map((item, index) => (
                <li key={index}>
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className="hover:text-white transition"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className="hover:text-white transition">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div>
            <h4 className="font-bold text-white mb-4">
              {data.footer.menus.solution.title}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {data.footer.menus.solution.items.map((item, index) => (
                <li key={index}>
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className="hover:text-white transition"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className="hover:text-white transition">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">
              {data.footer.menus.legal.title}
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {data.footer.menus.legal.items.map((item, index) => (
                <li key={index}>
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className="hover:text-white transition"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a href={item.href} className="hover:text-white transition">
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="mb-4 md:mb-0">{data.footer.copyright}</div>
          <div className="text-center md:text-right">
            {data.footer.businessInfo}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

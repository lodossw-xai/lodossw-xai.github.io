/**
 * Legal Page - Privacy Policy and Terms of Service
 * Uses the current agency navigation and the shared legal footer.
 */
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AgencyHeader from '../components/agency/AgencyHeader';
import Footer from '../components/layout/Footer';
import { getLocalizedData, legalData } from '../data';
import useLanguageStore from '../store/languageStore';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

function LegalPage({ type }: LegalPageProps): ReactElement {
  const { language } = useLanguageStore();
  const legalContent = getLocalizedData(legalData, language);
  const content = legalContent[type];

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      type === 'privacy'
        ? '개인정보처리방침 | XAIKOREA'
        : '서비스 이용약관 | XAIKOREA';
  }, [type]);

  return (
    <div className="rp-site rp-site--legal min-h-screen bg-background-light">
      <a className="rp-skip" href="#legal-main">
        본문 바로가기
      </a>
      <AgencyHeader />

      {/* Content */}
      <main id="legal-main" className="pt-40 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-6">
              {content.title}
            </h1>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {content.content}
              </p>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-ai-blue font-bold hover:gap-3 transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                {language === 'ko' ? '홈으로 돌아가기' : 'Return to Home'}
              </Link>
              <Link
                to="/contact#contact-inquiry"
                className="inline-flex items-center gap-2 font-bold text-gray-900 hover:gap-3 transition-all"
              >
                {language === 'ko' ? '문의 양식 작성하기' : 'Start an inquiry'}
                <span aria-hidden="true">↗</span>
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

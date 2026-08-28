import { useMemo } from 'react';
import {
  advisorsData,
  contactData,
  faqData,
  footerData,
  heroData,
  navigationData,
  servicesData,
  teamData,
  type Language,
} from '../data';
import useLanguageStore from '../store/languageStore';

interface LocalizedData {
  hero: (typeof heroData)[Language];
  services: (typeof servicesData)[Language];
  advisors: (typeof advisorsData)[Language];
  team: (typeof teamData)[Language];
  faq: (typeof faqData)[Language];
  contact: (typeof contactData)[Language];
  navigation: (typeof navigationData)[Language];
  footer: (typeof footerData)[Language];
  language: Language;
}

/**
 * Hook to get localized data based on current language
 */
export function useLocalizedData(): LocalizedData {
  const { language } = useLanguageStore();
  const lang = language as Language;

  const hero = useMemo(() => heroData[lang], [lang]);
  const services = useMemo(() => servicesData[lang], [lang]);
  const advisors = useMemo(() => advisorsData[lang], [lang]);
  const team = useMemo(() => teamData[lang], [lang]);
  const faq = useMemo(() => faqData[lang], [lang]);
  const contact = useMemo(() => contactData[lang], [lang]);
  const navigation = useMemo(() => navigationData[lang], [lang]);
  const footer = useMemo(() => footerData[lang], [lang]);

  return {
    hero,
    services,
    advisors,
    team,
    faq,
    contact,
    navigation,
    footer,
    language: lang,
  };
}

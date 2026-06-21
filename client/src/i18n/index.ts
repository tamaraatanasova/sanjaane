import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { mk, hr } from './locales';

const getLanguageFromHostname = () => {
  if (typeof window === 'undefined') {
    return 'mk';
  }

  const hostname = window.location.hostname.toLowerCase();

  if (hostname.startsWith('hr.')) {
    return 'hr';
  }

  return 'mk';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      mk: { translation: mk },
      hr: { translation: hr },
    },
    lng: getLanguageFromHostname(),
    fallbackLng: 'mk',
    supportedLngs: ['mk', 'hr'],
    interpolation: { escapeValue: false },
  });

export default i18n;

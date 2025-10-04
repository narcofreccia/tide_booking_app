import { useStateContext } from '../context/ContextProvider';

// Import all translation files
const translations = {
  en: require('../translations/en.json'),
  it: require('../translations/it.json'),
  es: require('../translations/es.json'),
};

export const useTranslation = (customLanguage = null) => {
  const { language } = useStateContext();
  const currentLang = customLanguage?.toLowerCase() || language?.toLowerCase() || 'en';

  const t = (keyOrMessage, interpolationValues = {}) => {
    // Handle validation error object format: { key: 'translation.key', values: {...} }
    if (typeof keyOrMessage === 'object' && keyOrMessage.key) {
      return t(keyOrMessage.key, keyOrMessage.values || {});
    }
    
    // Handle regular string keys
    if (typeof keyOrMessage !== 'string') {
      return keyOrMessage;
    }
    
    // If it doesn't look like a translation key (no dots), return as-is
    if (!keyOrMessage.includes('.')) {
      return keyOrMessage;
    }
    
    const keys = keyOrMessage.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
      value = value?.[k];
    }
    
    // If translation not found in current language, try English fallback
    if (!value && currentLang !== 'en') {
      let fallbackValue = translations['en'];
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
      }
      value = fallbackValue;
    }
    
    // If still no translation found, try to find it in any available language
    if (!value) {
      for (const langCode of Object.keys(translations)) {
        if (langCode !== currentLang && langCode !== 'en') {
          let anyLangValue = translations[langCode];
          for (const k of keys) {
            anyLangValue = anyLangValue?.[k];
          }
          if (anyLangValue) {
            value = anyLangValue;
            break;
          }
        }
      }
    }
    
    // If no translation found, return the original key
    if (!value) {
      return keyOrMessage;
    }
    
    // Apply template interpolation if interpolationValues provided
    if (typeof value === 'string' && Object.keys(interpolationValues).length > 0) {
      let interpolatedValue = value;
      Object.entries(interpolationValues).forEach(([placeholder, replacement]) => {
        // Replace {{placeholder}} with the actual value
        const regex = new RegExp(`{{\\s*${placeholder}\\s*}}`, 'g');
        interpolatedValue = interpolatedValue.replace(regex, replacement);
      });
      return interpolatedValue;
    }
    
    return value;
  };

  return { t };
};

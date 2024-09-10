import { languageOptions } from 'src/infrastructure/configs/languageOptions.js'

const getPrimaryLanguageCode = (lang) => lang.split('-')[0];

const parseAcceptedLanguages = (languageHeader) => {
  return languageHeader
    ? languageHeader.split(',')
      .map(lang => {
        const parts = lang.split(';q=');
        return {
          code: parts[0].split(';')[0],
          quality: parts.length > 1 ? parseFloat(parts[1]) : 1
        };
      })
      .sort((a, b) => b.quality - a.quality)
    : [];
};

const findInterfaceLanguage = (acceptedLanguages, availableLanguages) => {
  return acceptedLanguages.find(lang =>
    availableLanguages.some(availableLang =>
      getPrimaryLanguageCode(availableLang) === getPrimaryLanguageCode(lang.code)
    )
  )?.code || 'zh-TW';
};

const availableLanguages = languageOptions.map(lang => lang.value);

export default function initInterfaceLanguage(req = null) {
  try {
    let acceptedLanguages;
    const isServer = import.meta.env.SSR;
    if (isServer && req) {
      // Server-side: use request headers
      acceptedLanguages = parseAcceptedLanguages(req.headers['accept-language']);
    } else {
      // Client-side: use navigator.languages or navigator.language
      const userLanguages = navigator.languages || [navigator.language];
      acceptedLanguages = parseAcceptedLanguages(userLanguages.join(','));
    }
    return findInterfaceLanguage(acceptedLanguages, availableLanguages);
  } catch (error) {
    console.error('Error determining interface language:', error);
    return 'zh-TW';
  }
}

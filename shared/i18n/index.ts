import { EN_TRANSLATIONS, TranslationKey } from './en';
import { BN_TRANSLATIONS } from './bn';

export type Language = 'en' | 'bn';

export function t(key: TranslationKey, lang: Language = 'en'): string {
  if (lang === 'bn') {
    return BN_TRANSLATIONS[key] || EN_TRANSLATIONS[key] || key;
  }
  return EN_TRANSLATIONS[key] || key;
}

export { EN_TRANSLATIONS, BN_TRANSLATIONS };

import { translateSlug, getOriginalSlug } from './slugMapping';

/**
 * Creates a URL for the same page in a different language
 * @param {string} currentPath - The current URL path
 * @param {string} currentLocale - The current locale
 * @param {string} targetLocale - The target locale to switch to
 * @returns {string} - The URL path in the target language
 */
export function getLocalizedPath(currentPath, currentLocale, targetLocale) {
  // If the path is just the locale (homepage), return the new locale
  if (currentPath === `/${currentLocale}` || currentPath === `/${currentLocale}/`) {
    return `/${targetLocale}`;
  }
  
  // Split the path to get segments
  const segments = currentPath.split('/').filter(Boolean);
  
  // The first segment should be the current locale
  if (segments[0] !== currentLocale) {
    console.warn(`Expected first segment to be locale: ${currentLocale}, but got: ${segments[0]}`);
    return `/${targetLocale}${currentPath.startsWith('/') ? currentPath : '/' + currentPath}`;
  }
  
  // Get the remaining segments after the locale
  const pathSegments = segments.slice(1);
  
  // Translate the segments
  const translatedSegments = translatePathSegments(pathSegments, currentLocale, targetLocale);
  
  // Construct the new path
  return `/${targetLocale}/${translatedSegments.join('/')}`;
}

/**
 * Translate the segments of a path from one locale to another
 * @param {string[]} segments - The path segments to translate
 * @param {string} fromLocale - The source locale
 * @param {string} toLocale - The target locale
 * @returns {string[]} - The translated segments
 */
export function translatePathSegments(segments, fromLocale, toLocale) {
  if (segments.length === 0) return segments;
  
  // Create a copy of the segments
  const translatedSegments = [...segments];
  
  // Translate the first segment (page type)
  translatedSegments[0] = translateSlug(segments[0], fromLocale, toLocale);
  
  // If this is a jurisdiction page, translate the jurisdiction slug as well
  if (segments.length > 1 && (segments[0] === 'jurisdictions' || 
      getOriginalSlug(segments[0], fromLocale) === 'jurisdictions')) {
    translatedSegments[1] = translateSlug(segments[1], fromLocale, toLocale);
  }
  
  return translatedSegments;
}

/**
 * Get a URL for a jurisdiction in the current locale
 * @param {string} jurisdictionSlug - The original jurisdiction slug (e.g., 'amazonas-brazil')
 * @param {string} locale - The target locale
 * @returns {string} - The localized URL for the jurisdiction
 */
export function getJurisdictionUrl(jurisdictionSlug, locale) {
  const pageSlug = translateSlug('jurisdictions', 'en', locale);
  const localizedJurisdictionSlug = translateSlug(jurisdictionSlug, 'en', locale);
  
  return `/${locale}/${pageSlug}/${localizedJurisdictionSlug}`;
}

/**
 * Get a URL for a page in the current locale
 * @param {string} pageType - The page type (e.g., 'about', 'indicators')
 * @param {string} locale - The target locale
 * @returns {string} - The localized URL for the page
 */
export function getPageUrl(pageType, locale) {
  const localizedPageSlug = translateSlug(pageType, 'en', locale);
  return `/${locale}/${localizedPageSlug}`;
}

/**
 * A Link component wrapper that automatically translates paths between languages
 * This would be used in places like language switchers
 */
export function createLanguageSwitcherProps(currentPath, currentLocale, targetLocale) {
  return {
    href: getLocalizedPath(currentPath, currentLocale, targetLocale),
    locale: false // Tells Next.js not to add the locale prefix automatically
  };
} 
// Temporary mapping until spreadsheet is available
const slugMappings = {
  // Structure: { originalSlug: { es: 'spanish-slug', en: 'english-slug', pt: 'portuguese-slug' } }
  'about': {
    es: 'acerca-de',
    en: 'about',
    pt: 'sobre'
  },
  'indicators': {
    es: 'indicadores',
    en: 'indicators',
    pt: 'indicadores'
  },
  'jurisdictions': {
    es: 'jurisdicciones',
    en: 'jurisdictions',
    pt: 'jurisdicoes'
  },
  // Add more pages as needed
};

// Mapping for jurisdiction slugs
// Note: These are just examples, replace with actual jurisdictions
const jurisdictionSlugs = {
  // Structure: { originalSlug: { es: 'spanish-slug', en: 'english-slug', pt: 'portuguese-slug' } }
  'amazonas-brazil': {
    es: 'amazonas-brasil',
    en: 'amazonas-brazil',
    pt: 'amazonas-brasil'
  },
  'acre-brazil': {
    es: 'acre-brasil',
    en: 'acre-brazil',
    pt: 'acre-brasil'
  },
  'california-usa': {
    es: 'california-eeuu',
    en: 'california-usa',
    pt: 'california-eua'
  },
  // Add all jurisdictions here
};

// Merge all slug mappings
const allSlugs = {
  ...slugMappings,
  ...jurisdictionSlugs
};

// Reverse mappings for each language to find the original slug
const reverseSlugMappings = {};

// Initialize reverse mappings
Object.entries(allSlugs).forEach(([originalSlug, translations]) => {
  Object.entries(translations).forEach(([locale, translatedSlug]) => {
    if (!reverseSlugMappings[locale]) {
      reverseSlugMappings[locale] = {};
    }
    reverseSlugMappings[locale][translatedSlug] = originalSlug;
  });
});

/**
 * Translates a slug to the target language
 * @param {string} slug - The current slug
 * @param {string} fromLocale - The current locale
 * @param {string} toLocale - The target locale
 * @returns {string} - The translated slug
 */
export function translateSlug(slug, fromLocale, toLocale) {
  // If the locales are the same, return the original slug
  if (fromLocale === toLocale) return slug;
  
  // Find the original slug name
  const originalSlug = reverseSlugMappings[fromLocale]?.[slug];
  
  if (!originalSlug) {
    console.warn(`No mapping found for slug: ${slug} in locale: ${fromLocale}`);
    return slug; // Return original if no mapping exists
  }
  
  // Get the translated slug
  const translatedSlug = allSlugs[originalSlug]?.[toLocale];
  
  if (!translatedSlug) {
    console.warn(`No translation found for slug: ${originalSlug} to locale: ${toLocale}`);
    return slug; // Return original if no translation exists
  }
  
  return translatedSlug;
}

/**
 * Gets the original "canonical" slug from a translated one
 * @param {string} slug - The translated slug
 * @param {string} locale - The current locale
 * @returns {string} - The original canonical slug
 */
export function getOriginalSlug(slug, locale) {
  return reverseSlugMappings[locale]?.[slug] || slug;
}

/**
 * Checks if a slug exists in our mappings
 * @param {string} slug - The slug to check
 * @param {string} locale - The locale of the slug
 * @returns {boolean} - Whether the slug exists
 */
export function slugExists(slug, locale) {
  return !!reverseSlugMappings[locale]?.[slug];
}

/**
 * This function will be used to load slug mappings from a spreadsheet in the future
 */
export async function loadSlugMappingsFromSpreadsheet() {
  // This will be implemented when the spreadsheet is available
  // For now, we're using the hard-coded mappings
  return allSlugs;
} 
export const i18n = {
  defaultLocale: 'es',
  locales: ['es', 'en', 'pt'],
}

// Cache for loaded dictionaries
const dictionaries = {};

export const getDictionary = async (locale) => {
  
  // Return cached dictionary if available
  if (dictionaries[locale]) {
    return dictionaries[locale];
  }
  
  try {
    // Load the dictionary
    const dictionary = await import(`./translations/${locale}.json`);
    // Cache the dictionary
    dictionaries[locale] = dictionary.default;
    return dictionary.default;
  } catch (error) {
    console.error(`Error loading dictionary for locale: ${locale}`, error);
    // Return empty dictionary as fallback
    return {};
  }
}

// Clear cache function for testing
export const clearDictionaryCache = () => {
  Object.keys(dictionaries).forEach(key => {
    delete dictionaries[key];
  });
} 
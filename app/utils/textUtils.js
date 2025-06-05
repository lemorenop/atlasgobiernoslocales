import parse from "html-react-parser";

/**
 * Utility functions for text handling
 */

/**
 * Gets text by ID in the specified language from the provided data
 * @param {Array} data - Array of text objects with id, text_es, text_en, text_pt properties
 * @param {string} id - The ID of the text to retrieve
 * @param {string} lang - The language code (es, en, pt)
 * @returns {string} - The text in the specified language or empty string if not found
 */
export function getTextById(data, id, lang, replacements) {
  const item = data.find((item) => item.id === id);
  if (!item) return "";

  // Map language codes to the corresponding text field
  const langMap = {
    es: "text_es",
    en: "text_en",
    pt: "text_pt",
  };
  let text = item[langMap[lang]] ? item[langMap[lang]] : "";
  if (replacements) {
    replacements.forEach((replacement) => {
      text = text.replace(`[${replacement.id}]`, replacement.replace);
    });
  }
  return parse(text);
}
export function formatValue(value, unit_measure_id, lang) {
  return unit_measure_id === "perc"
    ? value.toFixed(2) + "%"
    : value.toLocaleString(lang === "es" || lang === "pt" ? "es" : "en");
}

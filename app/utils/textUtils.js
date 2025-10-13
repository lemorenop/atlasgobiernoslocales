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
      text = text.replaceAll(`[${replacement.id}]`, replacement.replace);
    });
  }
  return parse(text);
}
export function formatValue(value, unit_measure_id, lang, showUnit = true) {
  const unitLabel = () => {
    switch (unit_measure_id) {
      case "perc":
        return "%";
      case "km2":
        return "km2";
      case "hab_km2":
        return "hab/km2";
      default:
        return "";
    }
  };

  if ((value || value === 0) && !isNaN(value))
    return unit_measure_id === "perc"
      ? (Number.isInteger(value) ? value : value.toFixed(2)) +
          (showUnit ? "%" : "")
      : value.toLocaleString(lang === "es" || lang === "pt" ? "pt" : "en") +
          (showUnit ? unitLabel() : "");
  return unitLabel();
}

// Format function for axis labels
export const formatAxisLabel = (d, unitMeasureId) => {
  if (d === null || d === undefined) return;
  const replaceDotWithComma = (numStr) => numStr.replace(".", ",");

  // Mantener lógica original de K/M; solo cambiar el separador decimal a coma
  if (d >= 1000000) {
    const value = d / 1000000;
    return Number.isInteger(value)
      ? value + "M"
      : replaceDotWithComma(value.toFixed(1)) + "M";
  }
  if (d >= 1000) {
    const value = d / 1000;
    return Number.isInteger(value)
      ? value + "K"
      : replaceDotWithComma(value.toFixed(1)) + "K";
  }
  return Number.isInteger(d) ? String(d) : replaceDotWithComma(d.toFixed(1));
};

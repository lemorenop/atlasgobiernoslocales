/**
 * Utility functions to fetch data from various CSV sources
 */
import { getFromCache, setInCache } from "./cache";

const csv = {
  indicators:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=315846016&single=true&output=csv",
  regions:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=1578853195&single=true&output=cs",
  countries:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=2138553854&single=true&output=csv",
  levelPerCountry:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=198002196&single=true&output=csv",
  governments:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=490903592&single=true&output=csv",
  homeCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=425601317&single=true&output=csv",
  navbarCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=2043907821&single=true&output=csv",
  footerCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=636324315&single=true&output=csv",
  aboutCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=1578446695&single=true&output=csv",
  homeMapTooltip:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=1636436981&single=true&output=csv",
  allData:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=682419313&single=true&output=csv",
  yearData:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=845109380&single=true&output=csv",
  nationalAverages:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=129529016&single=true&output=csv",
  indicatorsCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=815048896&single=true&output=csv",
  jurisdictionsCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=1649672062&single=true&output=csv",
  pageError:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR88Y20j7R16cecEBrgZw4jK3Vg5kI0DoPMfIGzxgu6IxvBHCynnYarfS-5eKFgyg/pub?gid=757641088&single=true&output=csv",
  unitMeasures:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=328536948&single=true&output=csv",
};

/**
 * Fetches and parses data from a CSV URL
 * @param {string} csvUrl - URL of the CSV file
 * @returns {Promise<Array>} - Array of objects parsed from the CSV
 */
async function fetchAndParseCSV(csvUrl) {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Parse CSV respecting quotes and commas within text
    const rows = [];
    let currentRow = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];

      if (char === '"') {
        if (insideQuotes && csvText[i + 1] === '"') {
          // Handle escaped quotes (double quotes)
          currentCell += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        // End of cell
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if (char === "\n" && !insideQuotes) {
        // End of row
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }

    // Handle last row if not ended with newline
    if (currentCell !== "" || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }

    const headers = rows[0].map((h) => h.trim());

    // Convert to array of objects
    const data = rows.slice(1).map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index]?.trim();
      });
      return item;
    });

    return data;
  } catch (error) {
    console.error(`Error fetching data from ${csvUrl}:`, error);
    return [];
  }
}

/**
 * Fetches data with caching
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if not in cache
 * @returns {Promise<Array>} - Array of data objects
 */
async function fetchWithCache(key, fetchFn) {
  // Intentar obtener del caché
  const cachedData = getFromCache(key);
  if (cachedData) {
    return cachedData;
  }

  // Si no está en caché, obtener los datos
  const data = await fetchFn();

  // Almacenar en caché
  setInCache(key, data);

  return data;
}

/**
 * Fetches indicators data
 * @returns {Promise<Array>} - Array of indicator objects
 */
export async function getIndicators() {
  const csvUrl = csv.indicators;

  return fetchWithCache("indicators", async () => {
    const unitMeasures = await fetchAndParseCSV(csv.unitMeasures);
    const indicators = await fetchAndParseCSV(csvUrl).then((res) =>
      res.map((elm) => {
        elm.unit_measure_id = unitMeasures.find(
          (unit) => unit.id === elm.unit_measure_id
        );
        return elm;
      })
    );
    return indicators;
  });
}

/**
 * Fetches regions data
 * @returns {Promise<Array>} - Array of region objects
 */
export async function getRegions() {
  const csvUrl = csv.regions;
  return fetchWithCache("regions", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches countries data
 * @returns {Promise<Array>} - Array of country objects
 */
export async function getCountries() {
  const csvUrl = csv.countries;
  return fetchWithCache("countries", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches level per country data
 * @returns {Promise<Array>} - Array of level per country objects
 */
export async function getLevelPerCountry() {
  const csvUrl = csv.levelPerCountry;
  return fetchWithCache("levelPerCountry", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches governments data
 * @returns {Promise<Array>} - Array of government objects
 */
export async function getGovernments() {
  const csvUrl = csv.governments;
  return fetchWithCache("governments", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches all data in parallel
 * @returns {Promise<Object>} - Object containing all data
 */

export async function getHomeCopy() {
  const csvUrl = csv.homeCopy;
  return fetchWithCache("homeCopy", () => fetchAndParseCSV(csvUrl));
}
export async function getNavbarCopy() {
  const csvUrl = csv.navbarCopy;
  return fetchWithCache("navbarCopy", () => fetchAndParseCSV(csvUrl));
}
export async function getFooterCopy() {
  const csvUrl = csv.footerCopy;
  return fetchWithCache("footerCopy", () => fetchAndParseCSV(csvUrl));
}
export async function getAboutCopy() {
  const csvUrl = csv.aboutCopy;
  return fetchWithCache("aboutCopy", () => fetchAndParseCSV(csvUrl));
}
export async function getHomeMapTooltip() {
  const csvUrl = csv.homeMapTooltip;
  return fetchWithCache("homeMapTooltip", () => fetchAndParseCSV(csvUrl));
}
export async function getAllData() {
  const csvUrl = csv.allData;
  return fetchWithCache("allData", () => fetchAndParseCSV(csvUrl));
}

export async function getYearData() {
  const csvUrl = csv.yearData;
  return fetchWithCache("yearData", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches national averages data
 * @returns {Promise<Array>} - Array of national average objects
 */
export async function getNationalAverages() {
  const csvUrl = csv.nationalAverages;
  return fetchWithCache("nationalAverages", () => fetchAndParseCSV(csvUrl));
}

export async function getIndicatorsCopy() {
  const csvUrl = csv.indicatorsCopy;
  return fetchWithCache("indicatorsCopy", () => fetchAndParseCSV(csvUrl));
}

export async function getJurisdictionsCopy() {
  const csvUrl = csv.jurisdictionsCopy;
  return fetchWithCache("jurisdictionsCopy", () => fetchAndParseCSV(csvUrl));
}

export async function getGovernmentsData(lang = "es") {
  const validLangs = ["es", "en", "pt"];
  const language = validLangs.includes(lang) ? lang : "es";

  try {
    // En el cliente, necesitamos reconstruir la URL base sin incluir el segmento de idioma
    let url;
    if (typeof window !== "undefined") {
      // Estamos en el navegador
      const { protocol, host } = window.location;
      url = `${protocol}//${host}/data/governments_${language}.json`;
      console.log(`Client-side fetching from: ${url}`);
    } else {
      // Estamos en el servidor
      url = `/data/governments_${language}.json`;
      console.log(`Server-side fetching from: ${url}`);
    }

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `HTTP error ${response.status}: Could not load governments_${language}.json`
      );
      throw new Error(
        `Failed to load governments data for language ${language}`
      );
    }

    const data = await response.json();
    console.log(
      `Successfully loaded ${data.length} government entries for ${language}`
    );
    return data;
  } catch (error) {
    console.error("Error loading governments data:", error);
    return [];
  }
}

export async function getPageError() {
  const csvUrl = csv.pageError;
  return fetchWithCache("pageError", () => fetchAndParseCSV(csvUrl));
}

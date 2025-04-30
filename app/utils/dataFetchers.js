/**
 * Utility functions to fetch data from various CSV sources
 */
import { getFromCache, setInCache } from "./cache";
import Papa from "papaparse";

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
 * Fetches data from a URL with caching
 * @param {string} cacheKey - Key to use for caching
 * @param {Function} fetchFn - Function to fetch data
 * @returns {Promise<any>} - Fetched data
 */
async function fetchWithCache(cacheKey, fetchFn) {
  // Check if data is in cache
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Fetch data
  const data = await fetchFn();

  // Store in cache
  setInCache(cacheKey, data);

  return data;
}

/**
 * Fetches and parses CSV data using PapaParse
 * @param {string} csvUrl - URL of the CSV file
 * @param {string} lang - Language suffix
 * @returns {Promise<Array>} - Parsed CSV data
 */
async function fetchAndParseCSV(csvUrl, lang, id, filterID) {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
 
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const filteredResults = [];

          results.data.forEach((elm) => {
            // Si hay un filtro y el elemento no coincide, lo saltamos
            if (filterID && id && elm[filterID] !== id) {
              return;
            }

            const filteredObj = {};
            const languageSuffixes = ["_pt", "_en", "_es"];

            for (const [key, value] of Object.entries(elm)) {
              // Si la propiedad no termina en _idioma, la mantenemos
              if (!languageSuffixes.some((suffix) => key.endsWith(suffix))) {
                filteredObj[key] = value;
              } else {
                // Si termina en _idioma, solo la mantenemos si coincide con el lang actual
                const currentSuffix = `_${lang}`;
                if (key.endsWith(currentSuffix)) {
                  filteredObj[key] = value;
                }
              }
            }
            filteredResults.push(filteredObj);
          });

          resolve(filteredResults);
        },
        error: (error) => {
          console.error(`Error parsing CSV from ${csvUrl}:`, error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error(`Error fetching data from ${csvUrl}:`, error);
    return [];
  }
}

async function fetchAndParseDataCSV(csvUrl, code) {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          resolve(results.data.filter((elm) => elm.government_id === code));
        },
        error: (error) => {
          console.error(`Error parsing CSV from ${csvUrl}:`, error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error(`Error fetching data from ${csvUrl}:`, error);
    return [];
  }
}

/**
 * Fetches indicators data
 * @returns {Promise<Array>} - Array of indicator objects
 */
export async function getIndicators(lang) {
  const csvUrl = csv.indicators;
  const indicators = await Promise.all([
    fetchWithCache("unitMeasures", () =>
      fetchAndParseCSV(csv.unitMeasures, lang)
    ),
    fetchWithCache("indicators", () => fetchAndParseCSV(csvUrl, lang)),
  ]).then((results) => {
    return results[1].map((elm) => {
      elm.unit_measure_id = results[0].find(
        (unit) => unit.id === elm.unit_measure_id
      );
      return elm;
    });
  });
  return indicators;
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
export async function getCountries(lang, iso3) {
  const csvUrl = csv.countries;
  return fetchWithCache("countries", () => fetchAndParseCSV(csvUrl, lang, iso3, "iso3"));
}

/**
 * Fetches level per country data
 * @returns {Promise<Array>} - Array of level per country objects
 */
export async function getLevelPerCountry(lang) {
  const csvUrl = csv.levelPerCountry;
  return fetchWithCache("levelPerCountry", () => fetchAndParseCSV(csvUrl,lang));
}

/**
 * Fetches governments data
 * @returns {Promise<Array>} - Array of government objects
 */
export async function getGovernments(lang, slug,) {
  const csvUrl = csv.governments;
  return fetchWithCache("governments", () =>
    fetchAndParseCSV(csvUrl, lang, slug, "id")
  );
}


/**
 * Fetches home copy data
 * @returns {Promise<Array>} - Array of home copy objects
 */
export async function getHomeCopy(lang) {
  const csvUrl = csv.homeCopy;
  return fetchWithCache("homeCopy", () => fetchAndParseCSV(csvUrl, lang));
}

/**
 * Fetches navbar copy data
 * @returns {Promise<Array>} - Array of navbar copy objects
 */
export async function getNavbarCopy(lang) {
  const csvUrl = csv.navbarCopy;
  return fetchWithCache("navbarCopy", () => fetchAndParseCSV(csvUrl, lang));
}

/**
 * Fetches footer copy data
 * @returns {Promise<Array>} - Array of footer copy objects
 */
export async function getFooterCopy(lang) {
  const csvUrl = csv.footerCopy;
  return fetchWithCache("footerCopy", () => fetchAndParseCSV(csvUrl, lang));
}

/**
 * Fetches about copy data
 * @returns {Promise<Array>} - Array of about copy objects
 */
export async function getAboutCopy() {
  const csvUrl = csv.aboutCopy;
  return fetchWithCache("aboutCopy", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches home map tooltip data
 * @returns {Promise<Array>} - Array of home map tooltip objects
 */
export async function getHomeMapTooltip() {
  const csvUrl = csv.homeMapTooltip;
  return fetchWithCache("homeMapTooltip", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches all data
 * @returns {Promise<Array>} - Array of all data objects
 */
export async function getAllData() {
  const csvUrl = csv.allData;
  return fetchWithCache("allData", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches year data
 * @returns {Promise<Array>} - Array of year data objects
 */
export async function getYearData(lang,id) {
  const csvUrl = csv.yearData;
  return fetchWithCache("yearData", () => fetchAndParseCSV(csvUrl,lang,id,"country_iso3"));
}

/**
 * Fetches national averages data
 * @returns {Promise<Array>} - Array of national averages objects
 */
export async function getNationalAverages() {
  const csvUrl = csv.nationalAverages;
  return fetchWithCache("nationalAverages", () => fetchAndParseCSV(csvUrl));
}

/**
 * Fetches indicators copy data
 * @returns {Promise<Array>} - Array of indicators copy objects
 */
export async function getIndicatorsCopy(lang) {
  const csvUrl = csv.indicatorsCopy;
  return fetchWithCache("indicatorsCopy", () => fetchAndParseCSV(csvUrl,lang));
}

/**
 * Fetches jurisdictions copy data
 * @returns {Promise<Array>} - Array of jurisdictions copy objects
 */
export async function getJurisdictionsCopy(lang) {
  const csvUrl = csv.jurisdictionsCopy;
  return fetchWithCache("jurisdictionsCopy", () =>
    fetchAndParseCSV(csvUrl, lang)
  );
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

export async function getJurisdictionData(slug) {
  const csvUrl = csv.allData;
  return fetchWithCache(`jurisdictionData_${slug}`, () =>
    fetchAndParseDataCSV(csvUrl, slug)
  );
}

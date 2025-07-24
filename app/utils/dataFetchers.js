/**
 * Utility functions to fetch data from various CSV sources
 */
import { getFromCache, setInCache } from "./cache";
import Papa from "papaparse";

const csv = {
  indicators:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=315846016&single=true&output=csv",
  regions:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=1578853195&single=true&output=csv",
  countries:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=2138553854&single=true&output=csv",
  levelPerCountry:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=198002196&single=true&output=csv",
  governments:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=490903592&single=true&output=csv",
  homeCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=425601317&single=true&output=csv",
  navbarCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=2043907821&single=true&output=csv",
  footerCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=636324315&single=true&output=csv",
  aboutCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=1578446695&single=true&output=csv",
  homeMapTooltip:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=1636436981&single=true&output=csv",
  allData:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=682419313&single=true&output=csv",
  yearData:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=845109380&single=true&output=csv",
  nationalAverages:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=129529016&single=true&output=csv",
  indicatorsCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=815048896&single=true&output=csv",
  jurisdictionsCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=1649672062&single=true&output=csv",
  pageError:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=757641088&single=true&output=csv",
  unitMeasures:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=328536948&single=true&output=csv",
  metadataCopy:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=1840611032&single=true&output=csv",
  logValues:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBwGtY-iQJEsTB96oaLwFfMv9bRcB-dES_lSRQuBOU28iV_oinZTjZRNxXeMB88g/pub?gid=1734716137&single=true&output=csv",
 cacheCopy:"https://docs.google.com/spreadsheets/d/e/2PACX-1vRnYELJWxmMI7t7io-sG23uGzP7nCFu6ENP-yoa_K_vn-2qQUaWAedlCHGOdk65Fg/pub?gid=1441031514&single=true&output=csv"
};

/**
 * Fetches data from a URL with caching
 * @param {string} cacheKey - Key to use for caching
 * @param {Function} fetchFn - Function to fetch data
 * @returns {Promise<any>} - Fetched data
 */
async function fetchWithCache(cacheKey, fetchFn, lang) {
  try {
    // Fetch data
    const data = await fetchFn();
    return data.error ? data.data : data;
  } catch (error) {
    console.error(`❌ Error in fetchWithCache for key ${cacheKey}:`, error);
    throw new Error(`❌ Error in fetchWithCache for key ${cacheKey}:`, error);
  }
}

/**
 * Fetches and parses CSV data using PapaParse
 * @param {string} csvUrl - URL of the CSV file
 * @param {string} lang - Language suffix
 * @returns {Promise<Array>} - Parsed CSV data
 */
async function fetchAndParseCSV(csvUrl, lang, id, filterID, csvName) {
  const cachedData = getFromCache(csvUrl);
  function filterData(data) {
    const filteredResults = [];

    data.forEach((elm) => {
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
    return filteredResults;
  }

  if (cachedData) {
    console.log("🥳 Busco el CSV en cache ", csvUrl);
    return new Promise((resolve, reject) => {
      resolve(filterData(cachedData));
    });
  }
  //
  try {
    console.log("Busco el CSV por primera vez ", csvUrl);
    const response = await fetch(csv[csvUrl]);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          setInCache(csvUrl, results.data, Infinity);
          resolve(filterData(results.data));
        },
        error: (error) => {
          console.error(`❌ Error parsing CSV from ${csvUrl}:`, error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error(`❌ Error en fetchAndParseCSV fetching ${csvUrl}:`, error);
    throw new Error(`❌ Error en fetchAndParseCSV from ${csvUrl}:`, error);
  }
}

async function fetchAndParseDataCSV(csvUrl, code, csvName) {
  const cachedData = getFromCache(csvUrl);
  function filterData(data) {
    return data.filter((elm) => elm.government_id === code);
  }
  if (cachedData) {
    console.log("Busco el CSV en cache ", csvName);
    return new Promise((resolve, reject) => {
      resolve(filterData(cachedData));
    });
  }
  try {
    console.log("Busco el CSV por primera vez ", csvName);
    const response = await fetch(csv[csvUrl]);
    const csvText = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          setInCache(`${csvUrl}`, results.data, Infinity);
          resolve(filterData(results.data));
        },
        error: (error) => {
          console.error(`Error parsing CSV from ${csvUrl}:`, error);
          reject(error);
        },
      });
    });
  } catch (error) {
    throw new Error(`Error fetching data from ${csvUrl}:`, error);
  }
}

/**
 * Fetches indicators data
 * @returns {Promise<Array>} - Array of indicator objects
 */

export async function fetchData(key, lang) {
  const csvUrl = csv[key];

  try {
    const d = await fetchAndParseCSV(key, lang, null, null, key);
    return d;
  } catch (error) {
    throw new Error(`❌ Error en fetchData buscando el csv ${key}:`, error);
  }
}

/**
 * Fetches countries data
 * @returns {Promise<Array>} - Array of country objects
 */
export async function getCountries(lang, iso3) {
  console.log("🧘‍♀️ getCountries");
  const csvUrl = csv.countries;
  try {
    return fetchWithCache(
      `countries_${lang}_${iso3}`,
      () => fetchAndParseCSV("countries", lang, iso3, "iso3", "countries"),
      lang
    );
  } catch (error) {
    throw new Error(`❌ Error en getCountries:`, error);
  }
}

/**
 * Fetches governments data
 * @returns {Promise<Array>} - Array of government objects
 */
export async function getGovernments(lang, slug) {
  const startTime = performance.now();
  console.log("🧘‍♀️ getGovernments - Iniciando...");

  const csvUrl = csv.governments;
  const result = await fetchWithCache(
    `governments_${lang}_${slug}`,
    () => fetchAndParseCSV("governments", lang, slug, "id", "governments"),
    lang
  );

  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`⏱️ getGovernments completado en ${duration.toFixed(2)}ms`);

  return result;
}

export async function getGovernmentsByCountry(lang, codes, countryCode, level) {
  try {
    console.log("🧘‍♀️ getGovsByCountry");   
    const csvUrl = csv.allData;
    const csvParsed = await fetchAndParseCSV(
      "allData",
      lang,
      null,
      null,
      "allData"
    );
    const governments = csvParsed.filter((elm) =>
      codes.includes(elm.government_id)
    );
  
    return governments;
  } catch (error) {
    console.error(`❌ Error en getGovernmentsByCountry:`, error);
    throw new Error(`❌ Error en getGovernmentsByCountry:`, error);
  }
}
/**
 * Fetches all data
 * @returns {Promise<Array>} - Array of all data objects
 */
export async function getAllData() {
  console.log("🧘‍♀️ getAllData");
  const csvUrl = csv.allData;
  return fetchAndParseCSV("allData", "es", null, null, "allData");
}

/**
 * Fetches year data
 * @returns {Promise<Array>} - Array of year data objects
 */
export async function getYearData(lang, id) {
  console.log("🧘‍♀️ getYearData");
  const csvUrl = csv.yearData;
  return fetchWithCache(
    `yearData_${lang}_${id}`,
    () => fetchAndParseCSV("yearData", lang, id, "country_iso3", "yearData"),
    lang
  );
}

/**
 * Fetches national averages data
 * @returns {Promise<Array>} - Array of national averages objects
 */
export async function getNationalAverages() {
  console.log("🧘‍♀️ getNationalAverages");
  const csvUrl = csv.nationalAverages;
  return fetchAndParseCSV("nationalAverages", "es", null, null, "nationalAverages")
}

export async function getGovernmentsData(lang = "es") {
  console.log("🧘‍♀️ getGovernmentsData");
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
  } catch (error) {
    console.error("Error loading governments data:", error);
    return [];
  }
}

export async function getJurisdictionData(slug) {
  const startTime = performance.now();
  console.log("🧘‍♀️ getJurisdictionData - Iniciando...");

  const csvUrl = csv.allData;
  try {
    const result = await fetchAndParseDataCSV("allData", slug, "allData");

    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(
      `⏱️ getJurisdictionData completado en ${duration.toFixed(2)}ms`
    );

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(
      `❌ getJurisdictionData falló después de ${duration.toFixed(2)}ms`
    );
    throw new Error(`❌ Error en getJurisdictionData:`, error);
  }
}
export async function getIndicatorData(slug) {
  console.log("🧘‍♀️ getIndicatorData");
  const csvUrl = csv.allData;
  const allData = await fetchWithCache(
    `allData`,
      () => fetchAndParseCSV("allData", "es", null, null, "allData"),
    "es"
  );
  // Filtrar los datos por el ID del indicador
  const filteredData = allData.filter((item) => item.indicator_code == slug);
  // Transform array to object with indicator_code as keys
  const dataObject = filteredData.reduce((acc, item) => {
    acc[item.government_id] = item;
    return acc;
  }, {});
  // Preparar la respuesta
  return dataObject;
}

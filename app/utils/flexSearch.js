import FlexSearch from "flexsearch";
import governmentEs from "./governments/governments_es.json";
import governmentEn from "./governments/governments_en.json";
import governmentPt from "./governments/governments_pt.json";

const govs = { es: governmentEs, en: governmentEn, pt: governmentPt };
const verbose = true;
const locales = ["es", "en", "pt"];

let initializing = false;

const getSearchIndexByLocale = async (forceRegenerate = false) => {
  if (forceRegenerate) {
    if (verbose) console.info("0️⃣ CLEARING SEARCH INDEX");
    global.flexsearch = undefined;
    initializing = false;
  }

  if (global.flexsearch) {
    if (verbose) console.info("🔁 RE-UTILIZING SEARCH INDEX");
    return global.flexsearch;
  }

  try {
    if (!initializing) {
      if (verbose) console.info("1️⃣ LOADING PRE-BUILT SEARCH INDEX");
      initializing = true;
      global.flexsearch = await loadPreBuiltIndex();
    }
  } catch (e) {
    // Fallback: crear índice en runtime si falla la carga
    if (verbose) console.info("⚠️ FALLBACK: Creating search index at runtime");
    global.flexsearch = await newSearchIndex();
  }

  return global.flexsearch;
};

async function loadPreBuiltIndex() {
  if (verbose) console.info("📦 LOADING PRE-BUILT SEARCH CONFIGURATION");

  try {
    // Cargar configuración pre-generada
    const searchConfig = await import('./searchIndexes/searchConfig.json');
    
    const indexes = {};
    
    for (const locale of locales) {
      if (verbose) console.info(`📦 Loading pre-built index for ${locale}`);
      
      const index = new FlexSearch.Document({
        tokenize: "forward",
        cache: 100,
        document: {
          id: "id",
          index: [
            "name",
            "parentName",
            "countryName", 
            "completeName",
          ],
          store: ["id", "name", "parentName", "countryName", "completeName", "countryCode", "nivel"]
        },
      });

      // Agregar datos desde la configuración pre-generada
      const configData = searchConfig.default[locale];
      if (configData && configData.data) {
        configData.data.forEach(item => {
          index.add({
            id: item.id,
            name: item.name,
            parentName: item.parentName,
            countryName: item.countryName,
            completeName: item.completeName,
            countryCode: item.countryCode,
            nivel: item.nivel
          });
        });
      }
      
      indexes[locale] = index;
      if (verbose) console.info(`✅ Loaded pre-built index for ${locale} (${configData?.count || 0} items)`);
    }

    return indexes;
  } catch (error) {
    if (verbose) console.info("❌ Failed to load pre-built configuration:", error.message);
    throw error; // Re-lanzar para que el fallback se ejecute
  }
}

async function newSearchIndex() {
  if (verbose) console.info("🏳️ INITIALIZING FLEXSEARCH AT RUNTIME");

  const setups = locales.map((locale) => {
    if (verbose) console.info(`🏳️ INITIALIZING FLEXSEARCH ${locale} LOCALE`);

    const index = new FlexSearch.Document({
      tokenize: "forward",
      cache: 100,
      document: {
        id: "id",
        index: [
          "name",
          "parentName",
          "countryName",
          "completeName",
          // "fullName",
        ],
        store: ["id", "name", "parentName", "countryName", "completeName", "countryCode", "nivel"
          // "fullName"
        ]

      },
    });

    let indexed = 0;

    govs[locale].forEach((result) => {
      index.add(result);
      indexed++;
    });

    console.info(`🏳️   Indexed for ${locale}: ${indexed} elements`);

    return [locale, index];
  });

  return Object.fromEntries(await Promise.all(setups));
}

export default getSearchIndexByLocale;

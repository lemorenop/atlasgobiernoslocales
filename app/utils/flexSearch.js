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
      if (verbose) console.info("1️⃣ INITIALIZING SEARCH INDEX");
      initializing = true;
      global.flexsearch = await newSearchIndex();
    }
  } catch (e) {
    throw new Error(`
      Could not initialize FlexSearch engine.
      Details:
      ${e.message}
    `);
  }

  return global.flexsearch;
};

async function newSearchIndex() {
  if (verbose) console.info("🏳️ INITIALIZING FLEXSEARCH");

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
          "fullName",
        ],
        store: ["id", "name", "parentName", "countryName", "completeName", "fullName"]

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

import FlexSearch from "flexsearch";
import governmentEs from "./governments/governments_es.json";
import governmentEn from "./governments/governments_en.json";
import governmentPt from "./governments/governments_pt.json";
const govs = { es: governmentEs, en: governmentEn, pt: governmentPt };
const verbose = true;
const locales = ["es", "en", "pt"];

let initializing = {};
let searchIndexes = {};

const getSearchIndexByLocale = async (forceRegenerate = false, lang = "es") => {
  if (forceRegenerate) {
    if (verbose) console.info(`0️⃣ CLEARING SEARCH INDEX FOR ${lang}`);
    searchIndexes[lang] = undefined;
    initializing[lang] = false;
  }

  if (searchIndexes[lang]) {
    if (verbose) console.info(`🔁 RE-UTILIZING SEARCH INDEX FOR ${lang}`);
    return searchIndexes[lang];
  }

  try {
    if (!initializing[lang]) {
      if (verbose) console.info(`1️⃣ INITIALIZING SEARCH INDEX FOR ${lang}`);
      initializing[lang] = true;
      searchIndexes[lang] = await newSearchIndex(lang);
    }
  } catch (e) {
    throw new Error(`
      Could not initialize FlexSearch engine for ${lang}.
      Details:
      ${e.message}
    `);
  }

  return searchIndexes[lang];
};

async function newSearchIndex(lang) {
  if (verbose) console.info(`🏳️ INITIALIZING FLEXSEARCH FOR ${lang} LOCALE`);

  const index = new FlexSearch.Document({
    tokenize: "forward",
    cache: true,
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

  govs[lang].forEach((result) => {
    index.add(result);
    indexed++;
  });

  console.info(`🏳️   Indexed for ${lang}: ${indexed} elements`);

  return index;
}

export default getSearchIndexByLocale;

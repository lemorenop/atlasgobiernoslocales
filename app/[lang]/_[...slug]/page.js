// import { notFound } from "next/navigation";
import Jurisdiction2 from "../_singleJurisdiction2/page";
// import Indicator from "../_singleIndicator/page";
// import Home from "../page";
const { default: About } = require("../_about/page");
const { default: Custom404 } = require("../not-found");
function getKeyFromSlug(map, slug, lang) {
  for (const [key, translations] of Object.entries(map)) {
    if (translations[lang] === slug) return key;
  }
  return null;
}
const pageMap = {
  about: { en: "about", es: "acerca-de", pt: "sobre" },
  jurisdictions: {
    en: "jurisdictions",
    es: "jurisdicciones",
    pt: "jurisdicoes",
  },
  indicators: { en: "indicators", es: "indicadores", pt: "indicadores" },
};
export default async function Page({params}) {
  const {lang,slug} = await params;
  
  if (slug.length === 1) {
    const pageKey = getKeyFromSlug(pageMap, slug[0], lang);
    if (!pageKey) return <Custom404 lang={lang} />;

    switch (pageKey) {
      // case "about":
      //   return <About lang={lang} />;
      
      // case 'indicators':
      //   return <IndicatorsList lang={lang} />
      default:
        return <Custom404 lang={lang} />
    }
  }

  if (slug.length === 2) {
    const key = getKeyFromSlug(pageMap, slug[0], lang);
    if (!key) return <Custom404 lang={lang} />;
    const secondKey = slug[1]
    //  getKeyFromSlug(indicatorsMap, slug[1], lang);
    if (!secondKey) return <Custom404 lang={lang} />;
    switch (key) {
      case "jurisdictions":
        return <Jurisdiction2 lang={lang} slug={secondKey} />;
      // case "indicators":
      //   return <Indicator lang={lang} slug={secondKey}/>;
      default:
        return <Custom404 lang={lang} />;
    }
  }
}
export const revalidate = 10; // Revalidar cada 10 minutos

import { notFound } from "next/navigation";
import Jurisdictions from "../_jurisdictions/page";
import Jurisdiction from "../_singleJurisdiction/page";
import Indicator from "../_indicators/[slug]/page";
const { default: About } = require("../_about/page");
function getKeyFromSlug(map, slug, lang) {
  for (const [key, translations] of Object.entries(map)) {
    if (translations[lang] === slug) return key;
  }
  return null;
}
const pageMap = {
  about: { en: "about", es: "Acerca de", pt: "sobre" },
  jurisdictions: {
    en: "jurisdictions",
    es: "jurisdicciones",
    pt: "jurisdicoes",
  },
  indicators: { en: "indicators", es: "indicadores", pt: "indicadores" },
};
export default function Page({ params: { lang, slug } }) {
  
  if (slug.length === 1) {
    const pageKey = getKeyFromSlug(pageMap, slug[0], lang);
    if (!pageKey) return notFound();

    switch (pageKey) {
      case "about":
        return <About lang={lang} />;
      case "jurisdictions":
        return <Jurisdictions lang={lang} />;
      // case 'indicators':
      //   return <IndicatorsList lang={lang} />
      // default:
      //   return notFound()
    }
  }

  if (slug.length === 2) {
    const key = getKeyFromSlug(pageMap, slug[0], lang);
    if (!key) return notFound();
    const secondKey = slug[1]
    //  getKeyFromSlug(indicatorsMap, slug[1], lang);
    if (!secondKey) return notFound();
    switch (key) {
      case "jurisdictions":
        return <Jurisdiction lang={lang} slug={secondKey} />;
      case "indicators":
        return <Indicator lang={lang} slug={secondKey}/>;
      default:
        return notFound();
    }
  }
}

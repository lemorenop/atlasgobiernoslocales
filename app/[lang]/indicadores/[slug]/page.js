// import Indicator from "../../_singleIndicator/page";
import { fetchData } from "@/app/utils/dataFetchers";
import Hero from "./hero";
import { getCountries } from "@/app/utils/dataFetchers";
import MapContainer from "./mapContainer";

import IndicatorDataProvider from "./indicatorDataProvider";
import Custom404 from "@/app/[lang]/not-found";

export async function generateStaticParams() {
  const slugs = (await fetchData("indicators", "es")).filter((elm) => elm.slug);
  const locales = ["es", "en", "pt"];
  const params = [];

  for (const lang of locales) {
    for (const slug of slugs) {
      params.push({ lang, slug: slug.slug });
    }
  }
  return params;
}

export default async function Indicator({ params }) {
  const { lang, slug } = await params;
  const [indicators, copy, countries, levelPerCountry, regions] =
    await Promise.all([
      fetchData("indicators", lang),
      fetchData("indicatorsCopy", lang),
      getCountries(lang),

      fetchData("levelPerCountry", lang),
      fetchData("regions", lang),
    ]);
  const currentIndicator = indicators.find(
    (indicator) => indicator.slug === slug
  );
  if (!currentIndicator) {
    return <Custom404 lang={lang} />;
  }
  return (
    indicators &&
    copy &&
    countries &&
    levelPerCountry && (
      <main>
        <Hero
          lang={lang}
          slug={slug}
          copy={copy}
          indicators={indicators}
          indicator={currentIndicator}
        />
        <IndicatorDataProvider
          countries={countries}
          indicatorCode={currentIndicator.code}
          lang={lang}
        >
          <MapContainer
            regions={regions}
            countries={countries}
            lang={lang}
            levelPerCountry={levelPerCountry}
            copy={copy}
            indicator={currentIndicator}
          />
        </IndicatorDataProvider>
      </main>
    )
  );
}

export const dynamicParams = false;

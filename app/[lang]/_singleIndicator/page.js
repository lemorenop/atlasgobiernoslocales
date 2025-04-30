import { getIndicators, getIndicatorsCopy } from "@/app/utils/dataFetchers";
import Hero from "./hero";
import {
  getCountries,
  getRegions,
  getLevelPerCountry,
} from "@/app/utils/dataFetchers";
import MapContainer from "./mapContainer";

import IndicatorDataProvider from "./indicatorDataProvider";
import Custom404 from "../not-found";


export default async function Indicator({ lang, slug }) {
  const [indicators, copy,countries,levelPerCountry ] = await Promise.all([
    getIndicators(lang),
    getIndicatorsCopy(lang),
    getCountries(lang),
    getLevelPerCountry(lang),
  ]);
  const currentIndicator = indicators.find(
    (indicator) => indicator.slug === slug
  );
  if (!currentIndicator) {
    return <Custom404 lang={lang} />;
  }
  // const indicatorData = await fetchIndicatorData(currentIndicator.code);

  return (
    indicators&& copy && countries && levelPerCountry && <main>
      <Hero
        lang={lang}
        slug={slug}
        copy={copy}
        indicators={indicators}
        indicator={currentIndicator}
      />
      <IndicatorDataProvider indicatorCode={currentIndicator.code} lang={lang}>
        <MapContainer
          countries={countries}
          lang={lang}
          levelPerCountry={levelPerCountry}
          copy={copy}
          indicator={currentIndicator}
        />
      </IndicatorDataProvider>
    </main>
  );
}

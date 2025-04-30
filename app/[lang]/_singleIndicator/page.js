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
  const indicators = await getIndicators();
  const copy = await getIndicatorsCopy();
  const currentIndicator = indicators.find(
    (indicator) => indicator[`slug_${lang}`] === slug
  );
  if (!currentIndicator) {
    return <Custom404 lang={lang} />
  }
  // const indicatorData = await fetchIndicatorData(currentIndicator.code);
  const countries = await getCountries();
  const regions = await getRegions();
  const levelPerCountry = await getLevelPerCountry();
  return (
    <main>
      <Hero
        lang={lang}
        slug={slug}
        copy={copy}
        indicators={indicators}
        indicator={currentIndicator}
      />
      <IndicatorDataProvider indicatorCode={currentIndicator.code} lang={lang}>
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
  );
}
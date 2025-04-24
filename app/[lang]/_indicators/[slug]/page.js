import { getIndicators, getIndicatorsCopy } from "@/app/utils/dataFetchers";
import Hero from "./hero";
import {
  getCountries,
  getRegions,
  getLevelPerCountry,
} from "@/app/utils/dataFetchers";
import MapContainer from "./mapContainer";
export default async function Indicator({ lang, slug }) {
  const indicators = await getIndicators();
  const indicator = indicators.find(
    (indicator) => indicator[`slug_${lang}`] === slug
  );
  const copy = await getIndicatorsCopy(indicator);
  if (!indicator) {
    return <div>Indicator not found</div>;
  }
  const currentIndicator = indicators.find(
    (indicator) => indicator[`slug_${lang}`] === slug
  );
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
      <MapContainer
        regions={regions}
        countries={countries}
        lang={lang}
        levelPerCountry={levelPerCountry}
      />
    </main>
  );
}

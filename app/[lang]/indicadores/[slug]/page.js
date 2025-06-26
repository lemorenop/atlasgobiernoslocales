// import Indicator from "../../_singleIndicator/page";
import { fetchData } from "@/app/utils/dataFetchers";
import Hero from "./hero";
import { getCountries } from "@/app/utils/dataFetchers";
import MapContainer from "./mapContainer";

import IndicatorDataProvider from "./indicatorDataProvider";
import ScatterPlot from "./scatterPlot";
import DistributionChart from "./distributionChart";

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
  try {
    const [indicators, copy, countries, levelPerCountry, regions] =
      await Promise.all([
        fetchData("indicators", lang).then((res) =>
          res.sort((a, b) => (a.code < 4 ? 1 : -1))
        ),
        fetchData("indicatorsCopy", lang),
        getCountries(lang),
        fetchData("levelPerCountry", lang),
        fetchData("regions", lang).then((res) => {
          return res.map((elm) => {
            elm.iso3 = elm.id;
            return elm;
          });
        }),
      ]);
    const currentIndicator = indicators.find(
      (indicator) => indicator.slug === slug
    );

    return (
      indicators &&
      copy &&
      countries &&
      levelPerCountry && (
        <main className="flex flex-col justify-start text-black bg-white flex-grow ">
          <Hero
            lang={lang}
            slug={slug}
            copy={copy}
            indicators={indicators}
            indicator={currentIndicator}
          />
          <IndicatorDataProvider
            regions={regions}
            copy={copy}
            indicators={indicators}
            indicator={currentIndicator}
            countries={countries}
            levelPerCountry={levelPerCountry}
            indicatorCode={currentIndicator.code}
            lang={lang}
          >
            <MapContainer
              regions={regions}
              countries={countries}
              levelPerCountry={levelPerCountry}
            />
            <div className="max-md:pt-[120px] py-[80px] flex flex-col max-md:pb-[48px] gap-[80px] max-w-[1440px] mx-auto">
              <DistributionChart />
              <ScatterPlot />
            </div>
          </IndicatorDataProvider>
        </main>
      )
    );
  } catch (error) {
    console.error("Error fetching indicator data:", error);
    return notFound();
  }
}

export const dynamicParams = false;

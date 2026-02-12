import { fetchData } from "@/app/utils/dataFetchers";
import Hero from "./hero";
import { getCountries } from "@/app/utils/dataFetchers";
import MapContainer from "./mapContainer";
import { notFound } from "next/navigation";
import IndicatorDataProvider from "./indicatorDataProvider";
import ScatterPlot from "./scatterPlot";
import DistributionChart from "./distributionChart";
let indicatorsCached = { es: [], en: [], pt: [] };
let copyCached = { es: [], en: [], pt: [] };
let countriesCached = { es: [], en: [], pt: [] };
let levelPerCountryCached = { es: [], en: [], pt: [] };
let regionsCached = { es: [], en: [], pt: [] };
let categoriesCached = { es: [], en: [], pt: [] };

export const revalidate = 900;

export async function generateStaticParams() {
  const slugs = (
    await getCachedData(indicatorsCached, "es", () =>
      fetchData("indicators", "es")
    )
  ).filter((elm) => elm.slug);
  const locales = ["es", "en", "pt"];
  const params = [];

  for (const lang of locales) {
    for (const slug of slugs) {
      params.push({ lang, slug: slug.slug });
    }
  }
  return params;
}

async function getCachedData(obj, lang, func, key) {
  if (obj[lang].length === 0) {
    obj[lang] = await func();
  }
  return obj[lang];
}
export default async function Indicator({ params }) {
  const { lang, slug } = await params;
  console.log("-------- Indicator Page ", lang, "/", slug, " --------");
  try {
    const [indicators, copy, countries, levelPerCountry, regions, categories] =
      await Promise.all([
        getCachedData(
          indicatorsCached,
          lang,
          () => fetchData("indicators", lang),
          "indicators"
        ).then((res) => res.sort((a, b) => (a.code < 5 ? 1 : -1))),
        getCachedData(
          copyCached,
          lang,
          () => fetchData("indicatorsCopy", lang),
          "copy"
        ),
        getCachedData(
          countriesCached,
          lang,
          () => getCountries(lang),
          "countries"
        ),
        getCachedData(
          levelPerCountryCached,
          lang,
          () => fetchData("levelPerCountry", lang),
          "levelPerCountry"
        ),
        getCachedData(
          regionsCached,
          lang,
          () => fetchData("regions", lang),
          "regions"
        ).then((res) => {
          return res.map((elm) => {
            elm.iso3 = elm.id;
            return elm;
          });
        }),
        getCachedData(
          categoriesCached,
          lang,
          () => fetchData("categories", lang),
          "categories"
        ),
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
            categories={categories}
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
    return notFound();
  }
}

export const dynamicParams = false;

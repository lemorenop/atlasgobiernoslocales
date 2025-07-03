import Hero from "@/app/[lang]/jurisdicciones/[slug]/hero";
import RadarChart from "@/app/[lang]/jurisdicciones/[slug]/radarChart";
import { getTextById } from "@/app/utils/textUtils";
import {
  getGovernments,
  getCountries,
  getYearData,
  getJurisdictionData,
  fetchData,
} from "@/app/utils/dataFetchers";
import StickyBar from "./stickyBar";
import JurisdictionDataProvider from "./jurisdictionDataProvider";
import DotsChart from "./dotsChart";
import Comparative from "./comparative";
import RadarChartContainer from "./radarChartContainer";
import { notFound } from "next/navigation";

// export async function generateMetadata({ params }) {
//   const { lang, slug } = await params;
//   const copy = await fetchData("metadataCopy", lang);
//   if (slug) {
//     const jurisdiction = await getGovernments(lang, slug).then(
//       (data) => data[0]
//     );
//     return {
//       title: `${jurisdiction.name} | ${getTextById(copy, "title", lang)}`,
//       description: getTextById(copy, "description", lang),
//       alternates: {
//         canonical: `${process.env.NEXT_PUBLIC_URL}/${lang}/indicadores/${slug}`,
//       },
//     };
//   } else
//     return {
//       title: getTextById(copy, "title", lang),
//       description: getTextById(copy, "description", lang),
//     };
// }

export default async function Jurisdiction({ params }) {
  const { lang, slug } = await params;

  try {
    const [
      jurisdictionsCopy,
      indicatorsAll,
      government,
      unitMeasures,
      jurisdictionData,
    ] = await Promise.all([
      fetchData("jurisdictionsCopy", lang),
      fetchData("indicators", lang),
      getGovernments(lang, slug).then((data) => data[0]),
      fetchData("unitMeasures", lang),
      getJurisdictionData(slug),
    ]);
    if (
      !jurisdictionsCopy ||
      !indicatorsAll ||
      !government ||
      !unitMeasures ||
      !jurisdictionData
    )
      return notFound();
    const [country, years] = await Promise.all([
      getCountries(lang, government.country_iso3).then((data) => data[0]),
      getYearData(lang, government.country_iso3).then((data) => data[0]),
    ]);

    const yearPoblacion = years.year_population;
    const yearIndicators = years.year_indicators;
    const indicators = indicatorsAll.filter(elm=>elm.code!==25).map((elm) => {
      const unit = unitMeasures.find((unit) => unit.id === elm.unit_measure_id);
      elm.unit = unit;
      return { ...elm };
    });
    const indicatorsID = [21, 5, 7, 8, 13, 19, 10, 11, 12, 17, 20];
    const existRadarData = jurisdictionData.some(
      (elm) => indicatorsID.includes(elm.indicator_code) && elm.value !== null
    );
    const tooltipInfo = getTextById(jurisdictionsCopy, "tooltip_info", lang, [
      { id: "year", replace: yearPoblacion },
    ]);

    government["level"] =
      government.level_per_country_id?.split("_")[0] || null;

    return (
      <>
        <main
          id="main"
          className="flex flex-col justify-start text-black bg-white flex-grow "
        >
          <JurisdictionDataProvider
            country={country}
            slug={slug}
            lang={lang}
            indicators={indicators}
            jurisdictionsCopy={jurisdictionsCopy}
            government={government}
            tooltipInfo={tooltipInfo}
            jurisdictionData={jurisdictionData}
          >
            <Hero data={jurisdictionData} yearPoblacion={yearPoblacion} />

            <div className="">
              <StickyBar />
              <div className=" md:py-[80px] grid lg:grid-cols-12 gap-xl max-md:py-[48px] max-w-[1440px] mx-auto">
                {existRadarData && (
                  <>
                    <div
                      className="col-span-12  px-l md:px-[80px]"
                      id="radar-chart"
                    >
                      <RadarChartContainer yearIndicators={yearIndicators} />
                    </div>
                    <div className="relative h-[20px] sm:hidden">
                      <div className="absolute top-[-60px] left-[-60px] w-[120px] h-[120px] bg-navy rounded-full " />
                    </div>
                    <div
                      className="col-span-12 px-l md:px-[80px] lg:px-[160px]"
                      id="dots-chart"
                    >
                      <DotsChart />
                    </div>
                  </>
                )}

                <div className="col-span-12 px-l md:px-[80px]" id="comparative">
                  <Comparative yearIndicators={yearIndicators} />
                </div>
              </div>
            </div>
          </JurisdictionDataProvider>
        </main>
      </>
    );
  } catch (error) {
    console.error("❌ Error loading jurisdiction data:", error);
    return notFound();
  }

  // if (government) {
  //   //if government y meter todo dentro de un promise

  // } else return notFound();
}

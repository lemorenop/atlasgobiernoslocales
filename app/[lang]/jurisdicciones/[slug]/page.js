import Hero from "@/app/[lang]/jurisdicciones/[slug]/hero";
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

export default async function Jurisdiction({ params }) {
  const { lang, slug } = await params;

  try {
    const [
      jurisdictionsCopy,
      indicatorsAll,
      government,
      unitMeasures,
      levelPerCountry
    ] = await Promise.all([
      fetchData("jurisdictionsCopy", lang),
      fetchData("indicators", lang),
      getGovernments(lang, slug).then((data) => data[0]),
      fetchData("unitMeasures", lang),
      fetchData("levelPerCountry", lang),
    ]);
    if (
      !jurisdictionsCopy ||
      !indicatorsAll ||
      !government ||
      !unitMeasures ||
      !levelPerCountry
    )
      return notFound();
    const [country, years] = await Promise.all([
      getCountries(lang, government.country_iso3).then((data) => data[0]),
      getYearData(lang, government.country_iso3).then((data) => data[0]),
    ]);

    const yearPoblacion = years.year_population;
    const yearIndicators = years.year_indicators;
    const indicators = indicatorsAll
      .filter(elm => elm.code !== 25)
      .map((elm) => {
        const unit = unitMeasures.find((unit) => unit.id === elm.unit_measure_id);
        elm.unit = unit;
        return { ...elm };
      })
      .sort((a, b) => {
        if (a.code === 4) return 1;
        if (b.code === 4) return -1;
        return 0;
      });
   
    const tooltipInfo = getTextById(jurisdictionsCopy, "tooltip_info", lang, [
      { id: "year", replace: yearPoblacion },
    ]);
    const level = levelPerCountry.find(
      (elm) => elm.id === government.level_per_country_id && elm.country_iso3 === government.country_iso3
    );
    government["level"] =
      government.level_per_country_id?.split("_")[0] || null;
    government["level_name"] = level[`name_${lang}`];

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
          >
            <Hero 
            yearPoblacion={yearPoblacion} />

            <div className="">
              <StickyBar />
              <div className=" md:py-[80px] grid lg:grid-cols-12 gap-xl max-md:py-[48px] max-w-[1440px] mx-auto">
                
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
}

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
export default async function Jurisdiction({ params }) {
  const { lang, slug } = await params;
  const [
    jurisdictionsCopy,
    indicatorsAll,
    government,
    unitMeasures,
    jurisdictionData,
  ] = await Promise.all([
    fetchData("jurisdictionsCopy",lang),
      fetchData("indicators",lang),
    getGovernments(lang, slug).then((data) => data[0]),
    fetchData("unitMeasures",lang),
    getJurisdictionData(slug),
  ]);
  const country = government
    ? await getCountries(lang, government.country_iso3).then((data) => data[0])
    : null;
    const years=government
    ? await getYearData(lang, government.country_iso3).then(
        (data) => data[0]
      ): null;
  const yearPoblacion = years? years.year_population : null
    const yearIndicators=years? years.year_indicators : null
  const indicators = indicatorsAll.map((elm) => {
    const unit = unitMeasures.find((unit) => unit.id === elm.unit_measure_id);
    elm.unit = unit;
    return { ...elm };
  });
  const indicatorsID = [21, 5, 7, 8, 13, 19, 10, 11, 12, 17, 20];
  const existRadarData = jurisdictionData.some(
    (elm) => indicatorsID.includes(elm.indicator_code) && elm.value !== null
  );
  return (
    <main className="flex flex-col justify-start text-black bg-white flex-grow ">
      {jurisdictionsCopy && government && indicators && (
        <JurisdictionDataProvider
          slug={slug}
          lang={lang}
          indicators={indicators}
          jurisdictionsCopy={jurisdictionsCopy}
          government={government}
        >
          <Hero data={jurisdictionData} yearPoblacion={yearPoblacion} />
          {existRadarData && (
            <div className="">
              <StickyBar />
              <div className="px-l md:p-[80px] grid lg:grid-cols-12 gap-xl max-md:py-[48px]">
                <div className="lg:col-span-4 flex flex-col gap-[24px] justify-center">
                  <h2 className="max-md:text-[32px] text-h1 font-bold mb-4 text-navy">
                    {getTextById(jurisdictionsCopy, "indicators_title", lang)}
                  </h2>
                  <div className="bg-background p-xl ">
                    <p className="text-p">
                      {getTextById(
                        jurisdictionsCopy,
                        "indicators_subtitle",
                        lang,
                        [
                          { id: "jurisdiction", replace: government.name },
                          {
                            id: "country",
                            replace: country[`name_${lang}`],
                          },
                        ]
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col lg:col-span-8 min-h-[400px] md:min-h-[600px] max-h-screen">
                  <RadarChart
                  yearIndicators={yearIndicators}
                    country={country}
                    data={jurisdictionData}
                  
                  />
                </div>
              </div>
            </div>
          )}
        </JurisdictionDataProvider>
      )}
    </main>
  );
}

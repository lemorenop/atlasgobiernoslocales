import Hero from "@/app/[lang]/_singleJurisdiction/hero";
import RadarChart from "@/app/[lang]/_singleJurisdiction/radarChart";
import { getTextById } from "@/app/utils/textUtils";
import {
  getJurisdictionsCopy,
  getIndicators,
  getGovernments,
  getCountries,
  getYearData,
  getUnitMeasures,
  getJurisdictionData
} from "@/app/utils/dataFetchers";
export default async function Jurisdiction2({ lang, slug }) {
  const [jurisdictionsCopy, indicatorsAll, government,unitMeasures,jurisdictionData] = await Promise.all([
    getJurisdictionsCopy(lang),
    getIndicators(lang),
    getGovernments(lang, slug).then((data) => data[0]),
    getUnitMeasures(lang),getJurisdictionData(slug)
  ]);
  const country = government
    ? await getCountries(lang, government.country_iso3).then((data) => data[0])
    : null;
  const yearPoblacion = government
    ? await getYearData(lang, government.country_iso3).then(
        (data) => data[0].year_population
      )
    : null;
    const indicators=indicatorsAll.map(elm=>{
      const unit=unitMeasures.find(unit=>unit.id===elm.unit_measure_id)
      elm.unit=unit
      return {...elm}
    })
  return (
    <main className="flex flex-col justify-start text-black bg-white min-h-screen">
     
        {jurisdictionsCopy && government && indicators && (
          <>
            <Hero
            data={jurisdictionData}
              jurisdictionsCopy={jurisdictionsCopy}
              indicators={indicators}
              lang={lang}
              government={government}
              yearPoblacion={yearPoblacion}
            />
            <div className="p-[80px] grid lg:grid-cols-12 gap-xl">
              <div className="lg:col-span-4 flex flex-col gap-[24px] justify-center">
                <h2 className="text-h1 font-bold mb-4 text-navy">
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

              <div className="flex flex-col lg:col-span-8 min-h-[600px]">
                <RadarChart
                  country={country}
                  data={jurisdictionData}
                  copy={jurisdictionsCopy}
                  government={government}
                  indicators={indicators}
                />
              </div>
            </div>{" "}
          </>
        )}
    </main>
  );
}

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

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const copy = await fetchData("metadataCopy", lang);
  if (slug) {
    const jurisdiction = await getGovernments(lang, slug).then(
      (data) => data[0]
    );
    return {
      title: `${jurisdiction.name} | ${getTextById(copy, "title", lang)}`,
      description: getTextById(copy, "description", lang),
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_URL}/${lang}/indicadores/${slug}`,
      },
    };
  } else
    return {
      title: getTextById(copy, "title", lang),
      description: getTextById(copy, "description", lang),
    };
}

export default async function Jurisdiction({ params }) {
  const { lang, slug } = await params;
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
  const country = government
    ? await getCountries(lang, government.country_iso3).then((data) => data[0])
    : null;
  const years = government
    ? await getYearData(lang, government.country_iso3).then((data) => data[0])
    : null;
  const yearPoblacion = years ? years.year_population : null;
  const yearIndicators = years ? years.year_indicators : null;
  const indicators = indicatorsAll.map((elm) => {
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
  console.log(government);
  government["level"] = government.level_per_country_id?.split("_")[0] || null;
  return (
    <>
      {" "}
      <div
        id="capture-area"
        className="flex flex-col justify-start text-black bg-white flex-grow relative"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -9,
          width: "1400px",
          height: "auto",
          overflow: "hidden",
        }}
      />
      <main
        id="main"
        className="flex flex-col justify-start text-black bg-white flex-grow relative"
      >
        {jurisdictionsCopy && government && indicators && country && (
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
              <div className="px-l md:p-[80px] grid lg:grid-cols-12 gap-xl max-md:py-[48px] max-w-[1440px] mx-auto">
                {existRadarData && (
                  <>
                    <div className="lg:col-span-4 flex flex-col gap-[24px] justify-center">
                      <h2 className="max-md:text-[32px] text-h1 font-bold mb-4 text-navy">
                        {getTextById(
                          jurisdictionsCopy,
                          "indicators_title",
                          lang
                        )}
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

                    <RadarChart
                      yearIndicators={yearIndicators}
                      country={country}
                      data={jurisdictionData}
                      compareGov={
                        getTextById(jurisdictionsCopy, "average", lang) +
                        " " +
                        country[`name_${lang}`]
                      }
                    />

                    <div className="col-span-12 px-[80px]">
                      {" "}
                      <DotsChart />
                    </div>
                  </>
                )}

                <div className="col-span-12">
                  <Comparative yearIndicators={yearIndicators} />
                </div>
              </div>
            </div>
          </JurisdictionDataProvider>
        )}
      </main>
    </>
  );
}

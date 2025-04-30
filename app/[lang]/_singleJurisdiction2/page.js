// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
import Hero from "@/app/[lang]/_singleJurisdiction/hero";
import RadarChart from "@/app/[lang]/_singleJurisdiction/radarChart";
import { getTextById } from "@/app/utils/textUtils";
// import MapGoverment from "./mapGoverment";
// import RadarChart from "./radarChart";
// import { fetchJurisdictionData } from "@/app/utils/apiClient";
// import { getDictionary } from "@/app/i18n.config";
import {
  getJurisdictionsCopy,
  getIndicators,
  getGovernments,getCountries,getYearData
} from "@/app/utils/dataFetchers";
import JurisdictionDataProvider from "@/app/[lang]/_singleJurisdiction/jurisdictionDataProvider";
// import { getTextById } from "@/app/utils/textUtils";
// import Loader from "@/app/[lang]/components/loader";
export default async function Jurisdiction2({ lang, slug }) {
  const [jurisdictionsCopy, indicators, government] = await Promise.all([
    getJurisdictionsCopy(lang),
    getIndicators(lang),
    getGovernments(lang, slug).then((data) => data[0]),
    //getNationalAverages()
  ]);
  const country= await getCountries(lang,government.country_iso3).then((data)=>data[0])
  const yearPoblacion= await getYearData(lang,government.country_iso3).then((data)=>data[0].year_population)
  return (
    <main className="flex flex-col justify-start text-black bg-white min-h-screen">
      <JurisdictionDataProvider slug={slug} lang={lang}>
        {jurisdictionsCopy && government && indicators && (
          <>
            <Hero
              jurisdictionsCopy={jurisdictionsCopy}
              indicators={indicators}
              lang={lang}
              government={government}
              yearPoblacion={yearPoblacion}
            />
            {/* Radar chart */}
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
                          replace:country[`name_${lang}`],
                        },
                      ]
                    )}
                  </p>
                </div>
              </div>

             
                <div className="flex flex-col lg:col-span-8 min-h-[600px]">
                  <RadarChart
                    copy={jurisdictionsCopy}
                    government={government}
                    indicators={indicators}
                  />
                </div>
              
            </div>{" "}
          </>
        )}        
      </JurisdictionDataProvider>
    </main>
  );
}

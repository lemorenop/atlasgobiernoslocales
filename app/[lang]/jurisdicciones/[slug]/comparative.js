"use client";
import { useContext, useEffect, useState } from "react";

import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import { getTextById } from "@/app/utils/textUtils";
import SearchComparative from "./searchComparative";
import { getJurisdictionData } from "@/app/utils/dataFetchers";
import RadarChart from "./radarChart";
import Loader from "@/app/[lang]/components/loader";
export default function Comparative({ yearIndicators }) {
  const { jurisdictionsCopy, lang, government, country } = useContext(
    JurisdictionDataContext
  );
  const [compareJurisdiction, setCompareJurisdiction] = useState(null);
  const [comparativeData, setComparativeData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  useEffect(() => {
    if (compareJurisdiction) getData();
    async function getData() {
      setLoadingData(true);
      const data = await getJurisdictionData(compareJurisdiction.id);
      setLoadingData(false);
      setComparativeData(data);
    }
  }, [compareJurisdiction]);
  return (
    <>
      <div className="flex flex-col py-[48px]  md:max-w-[60%] mx-auto gap-[24px]">
        <h2 className="text-h2 font-bold text-navy text-center">
          {getTextById(jurisdictionsCopy, "compare_title", lang, [
            {
              id: "jurisdiction_name",
              replace: government.name,
            },
            { id: "country_name", replace: country[`name_${lang}`] },
          ])}
        </h2>
        <div className="max-w-[500px] mx-auto w-full exclude-from-capture">
          <SearchComparative
            value={compareJurisdiction}
            onChange={setCompareJurisdiction}
            countryCode={country.iso3}
            path={"jurisdicciones"}
            subtitle={getTextById(jurisdictionsCopy, "input_gov", lang)}
            lang={lang}
            nivel={government.level_per_country_id.slice("_")[0]}
            intro={""}
            label={getTextById(
              jurisdictionsCopy,
              "explore_jurisdiction_button",
              lang
            )}
          />
        </div>
      </div>
      {!comparativeData && loadingData && (
        <div className="flex justify-center items-center h-[400px]">
          <Loader className="w-10 h-10  min-w-10 min-h-10 [&_span]:w-full [&_span]:h-full" />
        </div>
      )}
      {compareJurisdiction && comparativeData && (
        <div className=" grid lg:grid-cols-12 gap-xl">
          <div className="lg:col-span-8">
            <RadarChart
              compareGov={compareJurisdiction.name}
              loadingData={loadingData}
              yearIndicators={yearIndicators}
              compareData={comparativeData}
              country={country}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-[24px] justify-center">
            <div className="bg-background p-xl ">
              <p className="text-p">
                {getTextById(jurisdictionsCopy, "compare_description", lang)}
              </p>
            </div>
            <a
              className="exclude-from-capture inline-flex items-center gap-2  bg-navy text-white px-3  shadow-inner shadow-white/10 focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer justify-between data-[open]:rotate-0 py-1.5 uppercase font-bold w-fit mx-auto"
              href={`/${lang}/jurisdicciones/${compareJurisdiction.id}`}
            >
              {getTextById(jurisdictionsCopy, "explore_gov", lang, [
                { id: "jurisdiction_name", replace: compareJurisdiction.name },
              ])}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

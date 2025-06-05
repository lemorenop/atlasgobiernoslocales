"use client";

import { useEffect, useState, createContext, useContext } from "react";
import "@/app/globals.css";
// import { fetchJurisdictionData } from "@/app/utils/apiClient";
import {
  getJurisdictionData,
  getGovernmentsByCountry,
} from "@/app/utils/dataFetchers";

// Create a context for the loading state
export const JurisdictionDataContext = createContext();

export default function JurisdictionDataProvider({
  lang,
  children,
  slug,
  indicators,
  jurisdictionsCopy,
  government,
  country,
}) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        // Dynamic import of governments file based on language
        const governmentsModule = await import(
          `@/app/utils/governments/governments_${lang}.json`
        ).then((res) =>
          res.default.filter(
            (r) =>
              r.countryCode === government.country_iso3 &&
              r.nivel === government.level_per_country_id.slice("_")[0]
          )
        );
        const codes = governmentsModule.map((elm) => elm.id);
        const govsByCountry = await getGovernmentsByCountry(
          lang,
          codes,
          government.country_iso3,
          government.level_per_country_id.slice("_")[0]
        );

        const dataJur = await getJurisdictionData(slug);
        setData({
          data: dataJur,
          governments: governmentsModule,
          governmentsData: govsByCountry,
        });
        console.log(governmentsModule)
      } catch (error) {
        setData({ data: null, governments: null, governmentsData: null });
        console.error(`Error loading government ${slug} data:`, error);
      }
    }

    loadData();
  }, [lang, slug, government]);

  return (
    <JurisdictionDataContext.Provider
      value={{ 
        data, 
        indicators, 
        jurisdictionsCopy, 
        lang, 
        government, 
        country,
        slug 
      }}
    >
      {children}
    </JurisdictionDataContext.Provider>
  );
}

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
  tooltipInfo,
  jurisdictionData,
}) {
  const [data, setData] = useState(null);
  const [mapRef, setMapRef] = useState(null);

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
        const url = `/api/govs-by-country?countryCode=${
          government.country_iso3
        }&level=${
          government.level_per_country_id.slice("_")[0]
        }&lang=${lang}&codes=${codes}`;
        const response = await fetch(url);
        const data = await response.json();
        const govsByCountry = data.data;

        setData({
          governments: governmentsModule,
          governmentsData: govsByCountry,
        });
      } catch (error) {
        setData({ governments: null, governmentsData: null });
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
        slug,
        tooltipInfo,
        jurisdictionData,
        mapRef,
        setMapRef,
      }}
    >
      {children}
    </JurisdictionDataContext.Provider>
  );
}

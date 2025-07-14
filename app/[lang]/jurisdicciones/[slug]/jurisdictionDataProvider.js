"use client";

import { useEffect, useState, createContext, useContext, useMemo } from "react";
import "@/app/globals.css";
// import { fetchJurisdictionData } from "@/app/utils/apiClient";

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
  // jurisdictionData,
}) {
  const [mapRef, setMapRef] = useState(null);
  const [jurisdictionData, setJurisdictionData] = useState(null);
  async function getData() {
    console.log(`🔎 Busco data en /api/gov-data?slug=${slug}`)
    console.time(`/api/gov-data?slug=${slug}`);

    const data = await fetch(`/api/gov-data?slug=${slug}`)
      .then((res) => res.json())
      .then((res) => res.data);

      console.timeEnd(`/api/gov-data?slug=${slug}`);

      // const data = await fetch(`/api/country-data/${government.country_iso3}`)
      //   .then((res) => res.json())
      //   .then((res) => res.filter((elm) => elm.government_id ===slug));
   
//API call for BRA: 17197ms  - timer ended vs API call for BRA: 7110ms - timer ended || BRA1100031
// API call for BRA: 24388ms - timer ended 
//API call for BRA: 7345ms - timer ended vs API call for BRA: 5651ms - timer ended
    setJurisdictionData(data);
  }
  useEffect(() => {
    getData();
  }, []);

  return (
    <JurisdictionDataContext.Provider
      value={{
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

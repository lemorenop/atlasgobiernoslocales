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
  jurisdictionData,
}) {

  const [mapRef, setMapRef] = useState(null);


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

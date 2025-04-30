"use client";

import { useEffect, useState, createContext, useContext } from "react";
import "@/app/globals.css";
// import { fetchJurisdictionData } from "@/app/utils/apiClient";
import { getJurisdictionData } from "@/app/utils/dataFetchers";

// Create a context for the loading state
export const JurisdictionDataContext = createContext();

export default function JurisdictionDataProvider({ lang, children, slug }) {
  const [data, setData] = useState({ data: null, governments: null });

  useEffect(() => {
    async function loadData() {
      try {
        const dataJur = await getJurisdictionData(slug);
        setData({ data: dataJur });
      } catch (error) {
        setData({ data: null });
        console.error(`Error loading government ${slug} data:`, error);
      }
    }

    loadData();
  }, [lang]);

  return (
    <JurisdictionDataContext.Provider value={data}>
      {children}
    </JurisdictionDataContext.Provider>
  );
}

"use client";

import { useEffect, useState, createContext, useContext } from "react";
import "@/app/globals.css";
import { fetchIndicatorData, fetchGovernments } from "@/app/utils/apiClient";

// Create a context for the loading state
export const IndicatorDataContext = createContext();

export default function IndicatorDataProvider({
  lang,
  children,
  indicatorCode,
}) {
  const [data, setData] = useState({ data: null, governments: null });

  useEffect(() => {
    async function loadData() {
      try {
        const [response, governments] = await Promise.all([
          fetchIndicatorData(indicatorCode).then((res) => res.data),
          fetchGovernments(lang, "json").then((res) => res.data),
        ]);
        setData({ data: response, governments });
      } catch (error) {
        setData({ data: null, governments: null });
        console.error("Error loading government data:", error);
        // setError(pageError);
      }
    }

    loadData();
  }, [lang]);

  return (
    <IndicatorDataContext.Provider value={data}>
      {children}
    </IndicatorDataContext.Provider>
  );
}

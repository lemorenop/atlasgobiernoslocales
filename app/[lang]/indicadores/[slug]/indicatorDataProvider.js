"use client";

import { useEffect, useState, createContext, useContext } from "react";
import "@/app/globals.css";

// Create a context for the loading state
export const IndicatorDataContext = createContext();

export default function IndicatorDataProvider({
  lang,
  children,
  indicatorCode,
  indicator,
  copy,
  indicators,
  countries,
  levelPerCountry,
  regions,
}) {
  const [data, setData] = useState({ data: null, governments: null });

  useEffect(() => {
    async function loadData() {
      try {
        console.time("Total API calls in IndicatorDataProvider");
        const [response, governments, logValues] = await Promise.all([
          fetch(`/api/indicators/${indicatorCode}`)
            .then((res) => res.json())
            .then((res) => res.data),
          fetch(`/api/governments?lang=${lang}&responseType=json`)
            .then((res) => res.json())
            .then((res) => res.data),
          fetch(`/api/log-values`)
            .then((res) => res.json())
            .then((res) => res.data),
        ]);

        const result = { ...governments };
        Object.entries(response).forEach(([key, value]) => {
          if (result[key]) {
            result[key] = {
              ...result[key],
              value: value,
            };
          }
        });

        setData({ governments: result, logValues });
        console.timeEnd("Total API calls in IndicatorDataProvider");
      } catch (error) {
        setData({ governments: null, logValues: null });
        console.error("Error loading government data:", error);
      }
    }

    loadData();
  }, [lang]);

  return (
    <IndicatorDataContext.Provider
      value={{
        ...data,
        indicator,
        copy,
        lang,
        indicators,
        countries,
        levelPerCountry,
        regions,
      }}
    >
      {children}
    </IndicatorDataContext.Provider>
  );
}

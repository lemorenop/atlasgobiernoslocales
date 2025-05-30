"use client";

import { useEffect, useState, createContext, useContext } from "react";
import "@/app/globals.css";

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
        console.time("Total API calls in IndicatorDataProvider");
        console.time("Indicators and governments API");
        const [response, governments] = await Promise.all([
          fetch(`/api/indicators/${indicatorCode}`)
            .then((res) => res.json())
            .then((res) => res.data),
          fetch(`/api/governments?lang=${lang}&responseType=json`)
            .then((res) => res.json())
            .then((res) => res.data),
        ]);
        console.timeEnd("Indicators and governments API");

        console.time("Data processing");
        const result = { ...governments };
        Object.entries(response).forEach(([key, value]) => {
          if (result[key]) {
            result[key] = {
              ...result[key],
              value: value,
            };
          }
        });
        console.timeEnd("Data processing");

        setData({ governments: result });
        console.timeEnd("Total API calls in IndicatorDataProvider");
      } catch (error) {
        setData({ data: null, governments: null });
        console.error("Error loading government data:", error);
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

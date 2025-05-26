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
        const [response, governments] = await Promise.all([
          fetch(`/api/indicators/${indicatorCode}`).then((res) => res.json()).then((res) => res.data),
          fetch(`/api/governments?lang=${lang}&responseType=json`).then((res) => res.json()).then((res) => res.data),
        ]);
        const result = { ...governments };
        Object.entries(response).forEach(([key, value]) => {
          if (result[key]) {
            result[key] = {
              ...result[key],
              value: value
            };
          }
        });
        // return result;
        setData({  governments:result });
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

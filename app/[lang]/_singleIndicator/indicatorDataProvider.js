"use client";

import { useEffect, useState, createContext, useContext } from "react";
import "@/app/globals.css";
import { fetchIndicatorData } from "@/app/utils/apiClient";
import { fetchGovernments } from "@/app/utils/apiClient";


// Create a context for the loading state
export const IndicatorDataContext = createContext();

export default function IndicatorDataProvider({ lang, children,indicatorCode }) {
    const [data, setData] = useState({data:null,governments:null});
    const [error, setError] = useState(null);
  
    useEffect(() => {
      async function loadData() {
        try {
            console.time('fetchIndicatorData');
            const response = await fetchIndicatorData(indicatorCode);
            console.timeEnd('fetchIndicatorData');
            
            console.time('fetchGovernments');
            const governments = await fetchGovernments();
            console.timeEnd('fetchGovernments');
            
            setData({data:response.data,governments});
        } catch (error) {
          console.error("Error loading government data:", error);
          setError(pageError);
        }
      }
  
      loadData();
    }, [lang]);
  
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center text-black bg-white min-h-screen">
          {error}
        </div>
      );
    }
  
    return (
      <IndicatorDataContext.Provider value={data} >
       {children}
      </IndicatorDataContext.Provider>
    );
  }
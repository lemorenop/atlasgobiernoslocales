"use client";

import { useEffect, useState } from "react";
import { addDocuments } from "@/app/utils/search";
import "@/app/globals.css";
import { getTextById } from "@/app/utils/textUtils";
import { fetchPageError } from "@/app/utils/apiClient";
export default function GovernmentDataProvider({ lang, children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Usar la API route en lugar de acceder directamente al archivo
        const url = `/api/governments?lang=${"fr"}`;
        const pageError = await fetchPageError().then(res=>getTextById(res,"title_no_data",lang));
        console.log(pageError);
        const response = await fetch(url, {
          cache: "no-store",
        });
        if (!response.ok) {setError(pageError);         
          throw new Error(
            `Error ${response.status}: ${pageError}`
          );
          
        }

        const data = await response.json();
        // Indexar los datos para la búsqueda
        addDocuments(data);
        setIsLoaded(true);
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
    <>
      {!isLoaded && (
        <div className="flex flex-col justify-center items-center text-black bg-white min-h-screen">
          <span className="loader" />
        </div>
      )}

      {isLoaded && children}
    </>
  );
}

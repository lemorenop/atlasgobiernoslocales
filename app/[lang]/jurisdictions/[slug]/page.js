"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Hero from "./hero";
import MapGoverment from "./mapGoverment";
import RadarChart from "./radarChart";
import { fetchJurisdictionData } from "@/app/utils/apiClient";
import { getDictionary } from "@/app/i18n.config";
import { getJurisdictionsCopy, getYearData } from "@/app/utils/dataFetchers";
import { getTextById } from "@/app/utils/textUtils";
export default function Jurisdiction() {
  const params = useParams();
  const router = useRouter();
  const { lang, slug } = params;
  const [government, setGovernment] = useState(null);
  const [governmentData, setGovernmentData] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dictionary, setDictionary] = useState({});
  const [jurisdictionsCopy, setJurisdictionsCopy] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener los datos filtrados desde la API y el diccionario de traducción
        const [data, dict] = await Promise.all([
          fetchJurisdictionData(slug),
          getDictionary(lang),
        ]);
        const jurCopy = await getJurisdictionsCopy();
        setJurisdictionsCopy(jurCopy);
        setGovernment(data.government);
        setGovernmentData(data.governmentData);
        setIndicators(data.indicators);
        setDictionary(dict);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message === "Gobierno no encontrado") {
          router.push(`/${lang}/404`);
        } else {
          // Manejar otros errores
          console.error("Error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, router, lang]); // Añadimos lang como dependencia

  if (loading) {
    return <div className="container mx-auto p-8">Cargando...</div>;
  }

  if (!government) {
    return null;
  }

  // Textos traducidos o fallbacks
  const jurisdictionDataText =
    dictionary?.jurisdictions?.data || "Datos de la jurisdicción";
  const noDataText =
    dictionary?.jurisdictions?.noData ||
    "No hay datos disponibles para esta jurisdicción";
  return (
    <main className="flex flex-col justify-start text-black bg-white ">
      <Hero
        jurisdictionsCopy={jurisdictionsCopy}
        indicators={indicators}
        data={governmentData}
        lang={lang}
        government={government}
      />

      {/* Mostrar los datos filtrados del gobierno */}
      <div className="p-[80px] grid grid-cols-12 gap-xl">
        <div className="col-span-3 flex flex-col gap-[24px]">
          <h2 className="text-h1 font-bold mb-4">
            {getTextById(jurisdictionsCopy, "indicators_title", lang)}
          </h2>
          <div className="bg-background p-xl ">
            <p className="text-p"></p>
          </div>
        </div>

        {governmentData.length > 0 ? (
          <div className="flex flex-col col-span-9 min-h-[600px]">
            <RadarChart
              government={government}
              data={governmentData}
              indicators={indicators}
            />
          </div>
        ) : (
          <p>{noDataText}</p>
        )}
      </div>
    </main>
  );
}

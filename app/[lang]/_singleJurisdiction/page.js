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
import Loader from "@/app/[lang]/components/loader";
export default function Jurisdiction({ lang, slug }) {
  const router = useRouter();

  const [government, setGovernment] = useState(null);
  const [governmentData, setGovernmentData] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dictionary, setDictionary] = useState({});
  const [jurisdictionsCopy, setJurisdictionsCopy] = useState([]);
  const [bounds, setBounds] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const fetchCopy = async () => {
      const jurCopy = await getJurisdictionsCopy();
      setJurisdictionsCopy(jurCopy);
    };
    fetchCopy();
    const fetchData = async () => {
      try {
        // Obtener los datos filtrados desde la API y el diccionario de traducción
        const [data, dict] = await Promise.all([
          fetchJurisdictionData(slug),
          getDictionary(lang),
        ]);
        const nivel = data.government.level_per_country_id.split("_")[0];

        const bounds = await fetch(
          `/api/bounds?govID=${data.government.id}&nivel=${nivel}`
        ).then((res) => res.json());
        if (bounds) setBounds(bounds);
        setGovernment(data.government);
        setGovernmentData(data.governmentData);
        setIndicators(data.indicators);
        setDictionary(dict);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (jurisdictionsCopy.length > 0)
          setErrorMessage(getTextById(jurisdictionsCopy, "try_again", lang));
        else
          setErrorMessage(
            lang === "es"
              ? "No se encontraron datos disponibles. Intente nuevamente."
              : lang === "en"
              ? "No data available. Please try again."
              : lang === "pt"
              ? "Não existem dados disponíveis. Por favor, tente novamente."
              : "No data"
          );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, router, lang]); // Añadimos lang como dependencia

  if (loading) {
    return <Loader />;
  }
  if (!government) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white p-m">
        <p className="text-black">{errorMessage}</p>
      </div>
    );
  }
  const noDataText =
    dictionary?.jurisdictions?.noData ||
    "No hay datos disponibles para esta jurisdicción";
  return (
    <main className="flex flex-col justify-start text-black bg-white min-h-screen">
      {(jurisdictionsCopy || indicators || governmentData || government) && (
        <>
          <Hero
            bounds={bounds}
            jurisdictionsCopy={jurisdictionsCopy}
            indicators={indicators}
            data={governmentData}
            lang={lang}
            government={government}
          />

          {/* Mostrar los datos filtrados del gobierno */}
          <div className="p-[80px] grid lg:grid-cols-12 gap-xl">
            <div className="lg:col-span-4 flex flex-col gap-[24px] justify-center">
              <h2 className="text-h1 font-bold mb-4 text-navy">
                {getTextById(jurisdictionsCopy, "indicators_title", lang)}
              </h2>
              <div className="bg-background p-xl ">
                <p className="text-p">
                  {getTextById(jurisdictionsCopy, "indicators_subtitle", lang, [
                    { id: "jurisdiction", replace: government.name },
                    {
                      id: "country",
                      replace: government.country[`name_${lang}`],
                    },
                  ])}
                </p>
              </div>
            </div>

            {governmentData.length > 0 ? (
              <div className="flex flex-col lg:col-span-8 min-h-[600px]">
                <RadarChart
                  copy={jurisdictionsCopy}
                  government={government}
                  data={governmentData}
                  indicators={indicators}
                />
              </div>
            ) : (
              <p>{errorMessage}</p>
            )}
          </div>
        </>
      )}
      {errorMessage && <p>{errorMessage}</p>}
    </main>
  );
}

"use client";
import { useState } from "react";
import { getTextById } from "@/app/utils/textUtils";
import Select from "@/app/[lang]/components/select";
import Arrow from "@/app/[lang]/components/icons/arrow";
import Loader from "../components/loader";

export default function Download({ lang, copy }) {
  const [isCSVLoading, setIsCSVLoading] = useState(false);
  const [isJSONLoading, setIsJSONLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRKwKAsoOMcUDMkZVh7AxfKGevtavC83xfz_Gnf0B9HFBAT4-3_7jcly1xXR5zVmxcJ7a3cKaMcNgFv/pub?output=csv";

  const handleCSVDownload = async (e) => {
    e.preventDefault();
    setIsCSVLoading(true);

    try {
      const response = await fetch(SPREADSHEET_URL);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data_${lang}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsCSVLoading(false);
    }
  };

  const handleJSONDownload = async (value) => {
    setIsJSONLoading(true);
    setSelectedOption(value);

    try {
      const fileName = value.id === "regional" ? "nivel_1_low.json" : "nivel_2_3_low.json";
      const response = await fetch(`/maps/${fileName}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const downloadName = value.id === "regional" 
        ? `nivel_1.json`
        : `nivel_2_3.json`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsJSONLoading(false);
      setSelectedOption("");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleCSVDownload}
        disabled={isCSVLoading}
        className={`w-full md:max-w-96 py-s font-bold justify-between gap-s bg-white border-1 border-black px-3 text-blue-CAF hover:bg-blue-CAF hover:text-white group transition-all flex items-center description ${
          isCSVLoading ? "" : "cursor-pointer"
        }`}
      >
        {isCSVLoading ? (
          <>
            {" "}
            <span>{getTextById(copy, "downloading", lang)}... </span>{" "}
            <Loader className="w-4 h-4 min-w-4 min-h-4 [&_span]:w-full [&_span]:h-full" />
          </>
        ) : (
          <>
            {getTextById(copy, "download_button_data", lang)}
            <Arrow className="w-4 h-4 stroke-blue-CAF stroke-2 group-hover:stroke-white transition-all" />
          </>
        )}
      </button>
      <div className="[&_button]:w-full [&_button]:md:max-w-96 [&_svg]:stroke-navy">
        
      <Select
        lang={lang}
        options={[{options:[
          {
            id: "regional",
            name_es: "Descargar shapes regionales",
            name_en: "Download regional shapes",
            name_pt: "Descarregar shapes regionais",
          },
          {
            id: "local",
            name_es: "Descargar shapes locales",
            name_en: "Download local shapes",
            name_pt: "Descarregar shapes locais",
          },
        ]}]}
        id="id"
        onChange={handleJSONDownload}
        value={selectedOption}
        label={
          isJSONLoading ? (
            <div className="flex items-center gap-s">
              <span>{getTextById(copy, "downloading", lang)}... </span>{" "}
              <Loader className="w-4 h-4 min-w-4 min-h-4 [&_span]:w-full [&_span]:h-full" />
            </div>
          ) : (
            getTextById(copy, "download_button_shapes", lang)
          )
        }
        disabled={isJSONLoading}
      />
      </div>

    </div>
  );
}

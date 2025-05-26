"use client";
import { useState } from "react";
import { getTextById } from "@/app/utils/textUtils";
import Select from "./select";
import Loader from "./loader";

export default function FooterDownload({ lang, copy }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const SPREADSHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=682419313&single=true&output=csv";

  const handleDownload = async (value) => {
    setIsLoading(true);
    setSelectedOption(value);

    try {
      if (value.id === "download_data") {
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
      } else {
        const fileName =
          value.id === "regional" ? "nivel_1.json" : "nivel_2.json";
        const response = await fetch(`/maps/${fileName}`);
        if (!response.ok) throw new Error("Download failed");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsLoading(false);
      setSelectedOption("");
    }
  };

  return (
    <Select
      lang={lang}
      options={[
        {
          options: [
            {
              id: "download_data",
              name_es: "Descargar datos",
              name_en: "Download data",
              name_pt: "Descarregar dados",
            },
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
          ],
        },
      ]}
      id="id"
      onChange={handleDownload}
      value={selectedOption}
      label={
        isLoading ? (
          <div className="flex items-center gap-s">
            <span>{getTextById(copy, "downloading", lang)}... </span>{" "}
            <Loader className="w-4 h-4 min-w-4 min-h-4 [&_span]:w-full [&_span]:h-full" />
          </div>
        ) : (
          `${getTextById(copy, "download_button", lang)}`
        )
      }
      disabled={isLoading}
    />
  );
}

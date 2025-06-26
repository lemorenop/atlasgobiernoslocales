"use client";
import { getTextById } from "@/app/utils/textUtils";
import Download from "../../components/download";
import RadarChart from "./radarChart";
import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import { useContext, useState, useCallback, useMemo } from "react";

export default function RadarChartContainer({ yearIndicators }) {
  const { government, jurisdictionsCopy, lang, country } = useContext(
    JurisdictionDataContext
  );
  const [downloadFunction, setDownloadFunction] = useState(null);
  const handleDownloadFunctionReady = useCallback((func) => {
    setDownloadFunction(() => func);
  }, []);
  const compareGov = useMemo(() => {
    return {
      name: getTextById(jurisdictionsCopy, "average", lang) +
        " " +
        country[`name_${lang}`],
      id: "national"
    }
  }, []);
  return (
    <div
      className="grid lg:grid-cols-12 gap-xl "
      
    >
    <>
      <div className="lg:col-span-4 flex flex-col gap-[24px] justify-center">
        <h2 className="max-md:text-[32px] text-h1 font-bold mb-4 text-navy">
          {getTextById(jurisdictionsCopy, "indicators_title", lang)}
        </h2>
        <div className="bg-background p-xl ">
          <p className="text-p">
            {getTextById(jurisdictionsCopy, "indicators_subtitle", lang, [
              {
                id: "jurisdiction",
                replace: government.name,
              },
              {
                id: "country",
                replace: country[`name_${lang}`],
              },
            ])}
          </p>
        </div>
        <Download
          downloadName={`${government.name}-radar-${getTextById(
            jurisdictionsCopy,
            "indicators_title",
            lang
          )}`}
          chartDataFunction={downloadFunction}
          lang={lang}
          copy={jurisdictionsCopy}
          refImage={"radar-chart"}
          buttonId="radar-chart"
        />
      </div>

      <RadarChart
        onDownloadFunctionReady={handleDownloadFunctionReady}
        yearIndicators={yearIndicators}
        compareGov={compareGov}
      />
      </>
    </div>
  );
}

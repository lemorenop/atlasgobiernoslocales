"use client";
import { getTextById } from "@/app/utils/textUtils";
import Arrow from "@/app/[lang]/components/icons/arrow";
import { handleCSVDownload } from "@/app/utils/downloadHandlers";
import DownloadShapes from "../components/downloadShapes";

export default function Download({ lang, copy }) {
  const downloadMethodology = copy.find(
    (item) => item.id === "download_button_methodology"
  ).link;
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={(e) => {
          handleCSVDownload(e);
        }}
        className={`w-full md:max-w-96 py-s font-bold justify-between gap-s bg-white border-1 border-black px-3 text-blue-CAF hover:bg-blue-CAF hover:text-white group transition-all flex items-center description cursor-pointer`}
      >
        {getTextById(copy, "download_button_data", lang)}
        <Arrow className="w-4 h-5 stroke-blue-CAF stroke-2 group-hover:stroke-white transition-all border-b-2 border-b-blue-CAF pb-[1px] group-hover:border-b-white" />
      </button>
      <div className="[&_button]:w-full [&_button]:md:max-w-96 [&_svg]:stroke-navy">
        <DownloadShapes lang={lang} copy={copy} buttonId="download-shapes" />
      </div>
      <a
        target="_blank"
        href={downloadMethodology}
        className="w-full md:max-w-96 py-s font-bold justify-between gap-s bg-white border-1 border-black px-3 text-blue-CAF hover:bg-blue-CAF hover:text-white group transition-all flex items-center description cursor-pointer"
      >
        {getTextById(copy, "download_button_methodology", lang)}{" "}
        <Arrow className="w-4 h-5 stroke-blue-CAF stroke-2 group-hover:stroke-white transition-all border-b-2 border-b-blue-CAF pb-[1px] group-hover:border-b-white" />
      </a>
    </div>
  );
}

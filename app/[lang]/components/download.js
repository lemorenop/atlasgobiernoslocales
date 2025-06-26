"use client";
import { getTextById } from "@/app/utils/textUtils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  downloadImage,
  handleCSVDownload,
  handleChartDataDownload,
} from "@/app/utils/downloadHandlers";
import Loader from "./loader";
import Expand from "./icons/expand";

export default function Download({
  lang,
  copy,
  refImage,
  buttonId,
  downloadName,
  chartDataFunction,disabled=false
}) {
  const options = [
    {
      id: "download_data",
      name: getTextById(copy, "download_data", lang),
      handleClick: (e) => handleCSVDownload(e),
    },

    {
      id: "download_image",
      name: getTextById(copy, "download_image", lang),
      handleClick: () =>
        downloadImage(refImage, null, buttonId, downloadName, lang),
    },
  ];
  if (chartDataFunction) {
    options.push({
      id: "download_current_data",
      name: getTextById(copy, "download_current_data", lang),
      handleClick: () =>
        handleChartDataDownload(chartDataFunction, downloadName || "chart-data"),
    });
  }
  return (
    <div className="exclude-from-capture w-full">
      <Menu>
        <MenuButton
          disabled={disabled}
          id={buttonId}
          className="w-full inline-flex items-center gap-2 bg-white border-1 border-black px-3 shadow-inner shadow-white/10 focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer text-blue-CAF justify-between data-[open]:rotate-0 py-s description font-bold  disabled:cursor-not-allowed"
        >
          {getTextById(copy, "download", lang)}
          <div id="capture-loader" className="hidden">
            <Loader className="w-full h-full [&_span]:w-[12px] [&_span]:h-[12px]" />
          </div>
          <Expand className="w-4 h-4 stroke-2 rotate-90 stroke-blue-CAF" />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom start"
          className="z-10 origin-top-right border border-black transition duration-100 ease-out  focus:outline-none data-closed:scale-95 data-closed:opacity-0 bg-white text-blue-CAF description p-m flex flex-col font-bold"
        >
          {options.map((option) => (
            <MenuItem key={option.id}>
              <button
                onClick={(e) => option.handleClick(e)}
                className="group flex w-full items-center gap-2 px-3 py-1.5 hover:bg-blue-CAF hover:text-white cursor-pointer"
              >
                {option.name}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}

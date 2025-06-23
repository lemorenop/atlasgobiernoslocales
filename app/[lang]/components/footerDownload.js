"use client";
import { useState } from "react";
import { getTextById } from "@/app/utils/textUtils";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import Loader from "./loader";
// import { Expand } from "lucide-react";
import {
  downloadImage,
  handleCSVDownload,
  handleChartDataDownload,
  handleShapesDownload,
} from "@/app/utils/downloadHandlers";
import Expand from "./icons/expand";
export default function FooterDownload({ lang, copy }) {
  const options = [
    {
      id: "download_data",
      name_es: "Descargar datos",
      name_en: "Download data",
      name_pt: "Descarregar dados",
      handleClick: (e) => handleCSVDownload(e),
    },
    {
      id: "regional",
      name_es: "Descargar shapes regionales",
      name_en: "Download regional shapes",
      name_pt: "Descarregar shapes regionais",
      handleClick: () => handleShapesDownload("regional", lang),
    },
    {
      id: "local",
      name_es: "Descargar shapes locales",
      name_en: "Download local shapes",
      name_pt: "Descarregar shapes locais",
      handleClick: () => handleShapesDownload("local", lang),
    },
  ];

  return (
    <Menu>
      <MenuButton className="w-80 inline-flex items-center gap-2 bg-white border-1 border-black px-3 shadow-inner shadow-white/10 focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer text-blue-CAF justify-between data-[open]:rotate-0 py-s description font-bold">
        {getTextById(copy, "download_button", lang)}
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
              {option[`name_${lang}`]}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}

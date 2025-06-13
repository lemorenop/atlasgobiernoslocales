"use client";
import { useState } from "react";
import { getTextById } from "@/app/utils/textUtils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { handleJSONDownload } from "@/app/utils/downloadHandlers";
import Loader from "./loader";
import Expand from "./icons/expand";
export default function DownloadShapes({ lang, copy, buttonId }) {
  const [isJSONLoading, setIsJSONLoading] = useState(false);
  const options = [
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
  ];
  return (
    <div className="exclude-from-capture w-full">
      <Menu>
        <MenuButton
          id={buttonId}
          className="w-full inline-flex items-center gap-2 bg-white border-1 border-black px-3 shadow-inner shadow-white/10 focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer text-blue-CAF justify-between data-[open]:rotate-0 py-s description font-bold"
        >
          {isJSONLoading ? (
            <>
              {" "}
              <span>{getTextById(copy, "downloading", lang)}... </span>{" "}
              <Loader className="w-4 h-4 min-w-4 min-h-4 [&_span]:w-full [&_span]:h-full" />
            </>
          ) : (
            <>
              {getTextById(copy, "download_button_shapes", lang)}

              <Expand className="w-4 h-4 stroke-blue-CAF stroke-2  transition-all rotate-90" />
            </>
          )}
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom start"
          className="z-10 origin-top-right border border-black transition duration-100 ease-out  focus:outline-none data-closed:scale-95 data-closed:opacity-0 bg-white text-blue-CAF description p-m flex flex-col font-bold"
        >
          {options.map((option) => (
            <MenuItem key={option.id}>
              <button
                onClick={async (e) => {
                  setIsJSONLoading(true);
                  await handleJSONDownload(option.id);
                  setIsJSONLoading(false);
                }}
                className="group flex w-full items-center gap-2 px-3 py-1.5 hover:bg-blue-CAF hover:text-white cursor-pointer"
              >
                {option[`name_${lang}`]}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}

"use client";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Expand from "./icons/expand";

export default function Select({
  options,
  onChange,
  lang,
  selected,
  id,
  defaultAllLabel,
  label,
  multiple = false,
}) {
  return (
    <div className="w-full">
      <Listbox
        value={selected}
        onChange={(e) => {
          if (!multiple) return onChange(e);
          const lastSelected = e[e.length - 1];
          const isAll = lastSelected?.[id] === "all";
          if (e.length > 1 && isAll) {
            onChange([e[e.length - 1]]);
            return;
          } else {
            const wasSelected = selected.some(
              (item) => item[id] === lastSelected[id]
            );
            if (!wasSelected && e.length > selected.length) {
              
              const isRegion = Number.isInteger(lastSelected?.[id]);
              if (isRegion) {
                const regionId = lastSelected[id];
                const regionCountries = options
                  .flatMap((opt) => opt.options)
                  .filter((opt) => opt.region_id === regionId && !opt.disabled);

                const newSelection = [...e, ...regionCountries];

                return onChange(
                  newSelection.filter((item) => item[id] !== "all")
                );
              } else return onChange(e.filter((item) => item[id] !== "all"));
            } else {
              
              if (e.length < selected.length) {
                const elementRemoved = selected.find(
                  (item) =>
                    !e.some((selectedItem) => selectedItem[id] === item[id])
                );
                const isRegion = Number.isInteger(elementRemoved?.[id]);
                if (isRegion) {
                  const regionId = elementRemoved[id];
                  return onChange(
                    e.filter(
                      (item) =>
                        item.region_id !== regionId &&
                        item[id] !== "all" &&
                        item[id] !== regionId
                    )
                  );
                }
              } else
                return onChange(
                  e.filter(
                    (item) =>
                      item[id] !== lastSelected[id] &&
                      item[id] !== "all" &&
                      item[id] !== lastSelected.region_id
                  )
                );
            }
            return onChange(e);
          }
        }}
        multiple={multiple}
      >
        <ListboxButton
          className={`${
            label ? "font-bold text-blue-CAF" : "text-placeholder"
          } w-full md:w-80 inline-flex items-center gap-2  bg-white border-1 border-black px-3  shadow-inner shadow-white/10 focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer  justify-between data-[open]:rotate-0 py-s description`}
        >
          {multiple
            ? label
            : label
            ? label
            : defaultAllLabel && selected[id] === "all"
            ? defaultAllLabel
            : selected[`name_${lang}`]}
          <Expand className="w-4 h-4 stroke-2 rotate-90 stroke-blue" />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className="w-80 origin-top-right transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 bg-white text-blue-CAF border-1 border-background uppercase description p-m flex flex-col font-bold max-h-[300px] overflow-y-auto z-20"
        >
          {options.map((option, index) => (
            <div key={index}>
              {option.group_title && (
                <div className="text-blue-CAF font-bold caption uppercase italic border-t-1 border-navy py-1.5 ">
                  {option.group_title}
                </div>
              )}
              {option.options.map((opt) => (
                <ListboxOption
                  disabled={opt.disabled ? true : false}
                  key={opt[id]}
                  value={opt}
                  className={`group flex  items-center gap-2  py-1.5 px-3 select-none 
                p-xs cursor-pointer ${
                  multiple && selected.map((elm) => elm[id]).includes(opt[id])
                    ? "bg-blue-CAF text-white"
                    : ""
                } ${
                    opt.disabled
                      ? "bg-[#92929240] hover:bg-[#92929240] cursor-not-allowed"
                      : "hover:bg-blue-CAF hover:text-white"
                  }`}
                >
                  {opt[`name_${lang}`]}
                </ListboxOption>
              ))}
            </div>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}

"use client";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import Expand from "./icons/expand";

export default function Select({ options, onChange, lang, selected ,id}) {
  return (
    <div className="w-full">
      <Listbox value={selected} onChange={onChange}>
        <ListboxButton
          className={`inline-flex items-center gap-2  bg-white border-1 border-black px-3  shadow-inner shadow-white/10 focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer text-placeholder justify-between data-[open]:rotate-0 py-s w-full`}
        >
          {selected[`name_${lang}`]}
          <Expand className="w-4 h-4 stroke-2 rotate-90 stroke-blue" />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className="w-96 origin-top-right transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 bg-white text-blue-CAF border-1 border-background uppercase description p-m flex flex-col font-bold h-[300px] overflow-y-auto"
        >
          {options.map((person) => (
            <ListboxOption
              key={person[id]}
              value={person}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
              <div className="hover:bg-blue-CAF hover:text-white p-xs text-black">
                {person[`name_${lang}`]}
              </div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}

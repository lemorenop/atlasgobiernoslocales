// components/SearchBox.js
"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState, useRef } from "react";
import { search } from "@/app/utils/search";
import Link from "next/link";
import { useIndexesLoaded } from "./governmentDataProvider";

export default function SearchBox({
  lang,
  label = "",
  title = "",
  subtitle = "",
  intro = "",
  path,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const isLoaded = useIndexesLoaded();

  // Open dropdown when query changes
  useEffect(() => {
    if (query.length > 1) {
      const result = search(query);

      setResults(result);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="bg-background p-xl flex flex-col gap-[24px] justify-between">
      <div className="flex flex-col gap-[24px]">
        <h2 className="text-h3 font-bold text-navy">{title}</h2>
        <p className="text-description text-black">{subtitle}</p>
      </div>
      <p className="paragraph-small text-black">{intro}</p>
      <Combobox value={""} disabled={!isLoaded}>
        <div className="relative">
          <ComboboxInput
            className="border border1 py-1.5 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white description text-black"
            label={label}
            placeholder={label}
            displayValue={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!isLoaded}
          />
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={
            "z-20 bg-white border [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0  cursor-pointer p-s h-[300px] overflow-y-auto w-[400px]"
          }
        >
          {results.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item}
              className="group flex cursor-default items-center gap-2 p-1 select-none hover:bg-blue-CAF hover:text-white transition-colors text-black"
            >
              <a
                className="flex flex-col w-full uppercase text-[14px] tracking-wide"
                href={`/${lang}/${path}/${item.id}`}
              >
                {item.name}, {item.parentName ? item.parentName + ", " : ""}
                {item.countryName}
              </a>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}

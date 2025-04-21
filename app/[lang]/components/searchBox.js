// components/SearchBox.js
"use client";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState, useRef } from "react";
import { search } from "@/app/utils/search";
import Link from "next/link";
export default function SearchBox({ lang, label = "",title='',path }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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
    <>
      <p className="paragraph-small">
      {title}
      </p>
      <Combobox value={""}>
        <div className="relative">
          <ComboboxInput
            className="border border1 py-1.5 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white description"
            label={label}
            placeholder={label}
            displayValue={query}
            onChange={(e) => setQuery(e.target.value)}
          />
         
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={
            "bg-white border [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0  cursor-pointer p-m"
          }
        >
          {results.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item}
              className="group flex cursor-default items-center gap-2 py-1.5 px-3 select-none hover:bg-blue-CAF hover:text-white transition-colors text-black"
            >
              <Link className="flex flex-col w-full" href={`${lang}/${path}/${item.id}`}>
                <strong className="">{item.name}</strong>

                <span className=" ">{item.countryName}</span>
                {item.completeName && <p className="">{item.completeName}</p>}
              </Link>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </>
  );
}

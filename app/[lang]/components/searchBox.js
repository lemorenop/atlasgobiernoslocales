// components/SearchBox.js
"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useEffect, useState,  } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Open dropdown when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}`);
          if (!response.ok) {
            throw new Error('Error fetching search results');
          }
          const data = await response.json();
          setResults(data);
        } catch (error) {
          console.error('Error searching:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    // Add a small delay to avoid too many API calls while typing
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, lang]);

  return (
    <div className="relative bg-background p-xl flex flex-col gap-[24px] justify-between">
      <div className="flex flex-col gap-[24px]">
        <h2 className="text-h3 font-bold text-navy">{title}</h2>
        <p className="text-description text-black">{subtitle}</p>
      </div>
      <Combobox value={selectedItem} onChange={setSelectedItem}>
        <div className="relative">
          <ComboboxInput
            disabled={isNavigating}
            className="border border1 py-1.5 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white description text-black"
            label={label}
            placeholder={label}
            displayValue={(item) => {
              if (item) {
                return `${item.name}, ${item.parentName ? item.parentName + ", " : ""}${item.countryName}`;
              }
              return query;
            }}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
          {isNavigating && (
            <div className="max-md:hidden absolute right-8 top-4 transform -translate-y-1/2">
              <span className="horizontal-loader"></span>
            </div>
          )}
         
        </div>{isNavigating && <div 
        style={{bottom:"4px",left:"0",right:"0",margin:"auto"}}
        className="md:hidden absolute right-0 left-0 w-fit transform -translate-y-1/2">
              <span className="horizontal-loader"></span>
            </div>}

        <ComboboxOptions
          anchor="bottom"
          transition
          className={
            "z-40 bg-white border [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0  cursor-pointer p-s h-[300px] overflow-y-auto w-[400px]"
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
                onClick={(e) => {
                  setSelectedItem(item);
                  setIsNavigating(true);
                }}
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

// components/SearchBox.js
"use client";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  RadioGroup,
  Radio,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Search from "./icons/search";

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
  const [noResults, setNoResults] = useState(false);
  const types = [
    { id: "all", name_es: "Todos", name_en: "All", name_pt: "Todos" },
    {
      id: "1",
      name_es: "Regional",
      name_en: "Regional",
      name_pt: "Regional",
    },
    { id: "2", name_es: "Local", name_en: "Local", name_pt: "Local" },
  ];
  const [typeSelected, setTypeSelected] = useState(types[0]);
  const router = useRouter();

  // Open dropdown when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        setIsLoading(true);
        try {
          if (typeSelected.id !== "2") {
            const response = await fetch(
              `/api/search?query=${encodeURIComponent(
                query
              )}&lang=${encodeURIComponent(lang)}${
                typeSelected.id !== "all" ? `&nivel=1` : ""
              }`
            );
            if (!response.ok) {
              throw new Error("Error fetching search results");
            }
            const data = await response.json();
            if (data.length === 0) {
              setNoResults(true);
            } else             setNoResults(false);
            setResults(data);
          } else {
            try {
              const [response1, response2] = await Promise.all([
                fetch(
                  `/api/search?query=${encodeURIComponent(
                    query
                  )}&lang=${encodeURIComponent(lang)}&nivel=2`
                ).then((res) => {
                  if (!res.ok)
                    throw new Error(`Error fetching nivel 2: ${res.status}`);
                  return res.json();
                }),
                fetch(
                  `/api/search?query=${encodeURIComponent(
                    query
                  )}&lang=${encodeURIComponent(lang)}&nivel=3`
                ).then((res) => {
                  if (!res.ok)
                    throw new Error(`Error fetching nivel 3: ${res.status}`);
                  return res.json();
                }),
              ]);
              if (response1.length === 0 && response2.length === 0) {
                setNoResults(true);
              } else setNoResults(false);
              setResults([...response1, ...response2]);
            } catch (error) {
              console.error("Error fetching search results:", error);
              setResults([]);
            }
          }
        } catch (error) {
          console.error("Error searching:", error);
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
  const typeName = {
    es: "Tipo de jurisdicción",
    en: "Type of jurisdiction",
    pt: "Tipo de jurisdição",
  };
  const noResultsText={es:"No se encontraron resultados",en:"No results found",pt:"Nenhum resultado encontrado"}
  return (
    <div className="relative bg-background p-xl flex flex-col gap-[24px] justify-between">
      <div className="flex flex-col gap-[24px]">
        <h2 className="text-h3 font-bold text-navy">{title}</h2>
        <p className="text-description text-black">{subtitle}</p>
      </div>
      <div className="flex  gap-s">
        <p className="text-description">Tipo de Jurisdicción:</p>
        <RadioGroup
          by="id"
          value={typeSelected}
          onChange={setTypeSelected}
          aria-label={typeName[lang]}
          className="space-y-2 flex gap-m"
        >
          {types.map((type) => (
            <Radio
              key={type.id}
              value={type}
              className="group relative flex cursor-pointer  text-black  transition focus:not-data-focus:outline-none data-checked:bg-white/10 data-focus:outline data-focus:outline-white items-start"
            >
              <div className="flex w-full items-center justify-between gap-xxs">
                <div className="relative">
                  <span
                    className={`rounded-full w-4 h-4  block group-data-checked:bg-navy bg-placeholder`}
                  />
                  <span className="rounded-full w-2 h-2 absolute top-0 left-0 bottom-0 right-0 m-auto  bg-white block" />
                </div>
                <p className="text-description text-black">
                  {type[`name_${lang}`]}
                </p>
              </div>
            </Radio>
          ))}
        </RadioGroup>
      </div>

      <Combobox
        value={selectedItem}
        onChange={(item) => {
          setSelectedItem(item);
          if (item) {
            window.location.href = `/${lang}/${path}/${item.id}`;
          }
        }}
      >
        <div className="relative">
          <ComboboxInput
            disabled={isNavigating}
            className="border border1 py-1.5 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white description text-black"
            label={label}
            placeholder={label}
            displayValue={(item) => {
              if (item) {
                return `${item.name}, ${
                  item.parentName ? item.parentName + ", " : ""
                }${item.countryName}`;
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
          {!isLoading && !isNavigating && (
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 stroke-2 stroke-black w-4 h-4" />
          )}
        </div>
        {isNavigating && (
          <div
            style={{ bottom: "4px", left: "0", right: "0", margin: "auto" }}
            className="md:hidden absolute right-0 left-0 w-fit transform -translate-y-1/2"
          >
            <span className="horizontal-loader"></span>
          </div>
        )}

        <ComboboxOptions
          anchor="bottom"
          transition
          className={
            "z-40 bg-white border [--anchor-gap:var(--spacing-1)] empty:invisible transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0  cursor-pointer p-s max-h-[300px] h-fit overflow-y-auto w-[400px]"
          }
        >
          {results.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item}
              className="group flex cursor-default items-center gap-2  select-none hover:bg-blue-CAF hover:text-white transition-colors text-black data-focus:bg-blue-CAF data-focus:text-white"
            >
              <a
                className="flex flex-col w-full uppercase text-[14px] tracking-wide p-1"
                href={`/${lang}/${path}/${item.id}`}
                onClick={() => {
                  setSelectedItem(item);
                  setIsNavigating(true);
                }}
              >
                {item.name}, {item.parentName ? item.parentName + ", " : ""}
                {item.countryName}
              </a>
            </ComboboxOption>
          ))}
          {noResults && (
            <p className="text-description text-black">
              {noResultsText[lang]}
            </p>
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}

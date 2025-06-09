"use client";
import { useEffect, useState, useContext } from "react";
import { getTextById } from "@/app/utils/textUtils";
import { IndicatorDataContext } from "./indicatorDataProvider";
import MapIndicator from "./mapIndicator";
import Loader from "@/app/[lang]/components/loader";
import { EmailIcon } from "next-share";
import SelectCountrySwitch from "./selectCountrySwitch";

export default function MapContainer({
  countries,
  levelPerCountry,
  regions,
}) {
  const regionsOpt = regions.map((elm) => {
    elm.iso3 = elm.id;
    return elm;
  });
  const { governments,copy, indicator,lang} = useContext(IndicatorDataContext);
  const maxPerLevel = {};
  if (governments && indicator.unit_measure_id !== "perc") {
    let nivel1 = [];
    let nivel2 = [];
      let nivel3 = [];
      Object.keys(governments).forEach((key) => {
        if (governments[key].nivel === "1") {
          nivel1.push(governments[key].value);
        } else if (governments[key].nivel === "2") {
          nivel2.push(governments[key].value);
        } else if (governments[key].nivel === "3") {
          nivel3.push(governments[key].value);
        }
      });
      maxPerLevel.nivel1 = Math.max(...nivel1);
      maxPerLevel.nivel2 = Math.max(...nivel2);
      maxPerLevel.nivel3 = Math.max(...nivel3);
  }
  const [selectedCountry, setSelectedCountry] = useState({
    name_es: "Todos",
    name_en: "All",
    name_pt: "Todos",
    iso3: "all",
  });
  const [countryCoordinates, setCountryCoordinates] = useState(null);
 
  const [selectedNivel, setSelectedNivel] = useState({
    name: getTextById(copy, "switch_local", lang),
    value: "2",
  });
  

  useEffect(() => {
    fetchCoordinates();
    async function fetchCoordinates() {
      if (selectedCountry.iso3 !== "all") {
        const response = await fetch(`/api/countries/${selectedCountry.iso3}`);
        const geojson = await response.json();
        setCountryCoordinates(geojson);
      }
    }
  }, [selectedCountry]);

  return (
    <div className="relative bg-background">
      <div className="flex max-md:flex-col max-md:w-full gap-m absolute max-md:top-[60px] top-0 left-0 z-10 p-m">
        <SelectCountrySwitch
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedNivel={selectedNivel}
          setSelectedNivel={setSelectedNivel}          
          levelPerCountry={levelPerCountry}
          
          options={[  
            {
             
              options: [
                {
                  name_es: "Todos",
                  name_en: "All",
                  name_pt: "Todos",
                  iso3: "all",
                },
               
              ],
            },{
              group_title:getTextById(copy, "regions", lang),
              options:regionsOpt
            },
            {
              group_title:getTextById(copy, "countries", lang),
              options:countries.sort((a, b) =>
                a["name_" + lang].localeCompare(b["name_" + lang])
              ),
            }
        ]}
        />
       
      </div>
      <div className="h-[90vh] w-full">
        {governments ? (
          <MapIndicator
            maxPerLevel={maxPerLevel}
            countries={countries}
            copy={copy}
            countryCoordinates={countryCoordinates}
            selectedNivel={selectedNivel}
            governments={governments}
            lang={lang}
            selectedCountryIso3={selectedCountry.iso3}
            indicator={indicator}
          />
        ) : (
          <Loader className="w-full h-full [&_span]:w-[48px] [&_span]:h-[48px]" />
        )}
      </div>
    </div>
  );
}

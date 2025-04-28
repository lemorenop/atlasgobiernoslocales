"use client";
import Select from "@/app/[lang]/components/select";
import { useEffect, useState, useContext } from "react";
import LevelSwitch from "./levelSwitch";
import { getTextById } from "@/app/utils/textUtils";
import { IndicatorDataContext } from "./indicatorDataProvider";
import MapIndicator from "./mapIndicator";
import Loader from "@/app/[lang]/components/loader";

export default function MapContainer({
  regions,
  countries,
  levelPerCountry,
  lang,
  copy,
}) {
  const { data, governments } = useContext(IndicatorDataContext);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    name_es: "Todos",
    name_en: "All",
    name_pt: "Todos",
    iso3: "all",
  });
  const [countryCoordinates, setCountryCoordinates] = useState(null);
  const [countryLevels, setCountryLevels] = useState(null);
  const [selectedNivel, setSelectedNivel] = useState({
    name: getTextById(copy, "switch_local", lang),
    value: "2",
  });
  const [niveles, setNiveles] = useState([
    {
      name: getTextById(copy, "switch_region", lang),
      value: "1",
    },
    {
      name: getTextById(copy, "switch_local", lang),
      value: "2",
    },
  ]);
  useEffect(() => {
    fetchCoordinates();
    async function fetchCoordinates() {
      if (selectedCountry.iso3 !== "all") {
        const response = await fetch(`/api/countries/${selectedCountry.iso3}`);
        const geojson = await response.json();
        setCountryCoordinates(geojson);
      }
    }
    const countryLevels = levelPerCountry.filter(
      (level) =>
        level.country_iso3 === selectedCountry.iso3 &&
        (level.id === "1_1" || level.id === "2_1" || level.id === "3_1")
    );
    setCountryLevels(countryLevels);
    if (
      selectedCountry.iso3 === "HTI" ||
      selectedCountry.iso3 === "DOM" ||
      selectedCountry.iso3 === "PER" ||
      selectedCountry.iso3 === "SLV"
    ) {
      const nivel1PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "1_1"
      );
      const nivel2PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "2_1"
      );
      setNiveles([
        {
          name:nivel1PerCountry? nivel1PerCountry[`name_${lang}`]:getTextById(copy, "switch_region", lang),

          value: "1",
        },
        {
          name: nivel2PerCountry? nivel2PerCountry[`name_${lang}`]:getTextById(copy, "switch_local", lang),
          value: "2",
        },
      ]);
      if(selectedNivel.value==="1"){
        setSelectedNivel({
          name: nivel1PerCountry? nivel1PerCountry[`name_${lang}`]:getTextById(copy, "switch_region", lang),
          value: "1",
        })
      }else {
        setSelectedNivel({
          name: nivel2PerCountry? nivel2PerCountry[`name_${lang}`]:getTextById(copy, "switch_local", lang),
          value: "2",
        })
      }
    }else {
      setNiveles([
        {
          name: getTextById(copy, "switch_region", lang),
          value: "1",
        },
        {
          name: getTextById(copy, "switch_local", lang),
          value: "2",
        },
      ]);
      if(selectedNivel.value==="1"){
        setSelectedNivel({
          name: getTextById(copy, "switch_region", lang),
          value: "1",
        })
      } else {
        setSelectedNivel({
          name: getTextById(copy, "switch_local", lang),
          value: "2",
        })
      }
    }
  }, [selectedCountry]);
  return (
    <div className="relative">
      <div className="flex gap-m absolute top-0 left-0 z-10 p-m">
        <div className="w-72">
          <Select
            id="iso3"
            selected={selectedCountry}
            options={[
              {
                name_es: "Todos",
                name_en: "All",
                name_pt: "Todos",
                iso3: "all",
              },
              ...countries,
            ]}
            label="Country"
            onChange={setSelectedCountry}
            lang={lang}
          />
        </div>

        <LevelSwitch
          handleChange={setSelectedNivel}
          value={selectedNivel}
          options={niveles}
        />
      </div>
      <div className="h-[90vh] w-full">
        {data && governments ? (
          <MapIndicator
            countryCoordinates={countryCoordinates}
            selectedNivel={selectedNivel}
            data={data}
            governments={governments}
            lang={lang}
            selectedCountryIso3={selectedCountry.iso3}
          />
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}

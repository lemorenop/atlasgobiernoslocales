"use client";
import Select from "@/app/[lang]/components/select";
import { useEffect, useState, useContext } from "react";
import LevelSwitch from "./levelSwitch";
import { getTextById } from "@/app/utils/textUtils";
import { IndicatorDataContext } from "./indicatorDataProvider";
import MapIndicator from "./mapIndicator";
import Loader from "@/app/[lang]/components/loader";

export default function MapContainer({
  countries,
  levelPerCountry,
  lang,
  copy,
  indicator
}) {
  const { data, governments } = useContext(IndicatorDataContext);
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
    if (selectedCountry.iso3 === "PER") {
      const nivel1PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "1_1"
      );
      const nivel2PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "2_1"
      );
      const nivel3PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "3_1"
      );
      const options = [
        {
          name: nivel1PerCountry[`name_${lang}`],
          value: "1",
        },
        {
          name: nivel2PerCountry[`name_${lang}`],
          value: "2",
        },
        {
          name: nivel3PerCountry[`name_${lang}`],
          value: "3",
        },
      ];
      setNiveles(options);
      if (selectedNivel.value === "1") {
        setSelectedNivel(options[0]);
      } else if (selectedNivel.value === "2") {
        setSelectedNivel(options[1]);
      } else {
        setSelectedNivel(options[2]);
      }
    } else if (selectedCountry.iso3 === "SLV" || selectedCountry.iso3 === "DOM" || selectedCountry.iso3 === "HTI") {
      const nivel2PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "2_1"
      );
      const nivel3PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "3_1"
      );
      const options = [
        {
          name: nivel2PerCountry[`name_${lang}`],
          value: "2",
        },
        {
          name: nivel3PerCountry[`name_${lang}`],
          value: "3",
        },
      ];
      setNiveles(options);
        setSelectedNivel(options[1]);
     
    } else if (
      selectedCountry.iso3 === "HTI" ||
      selectedCountry.iso3 === "DOM"
    ) {
      const nivel1PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "1_1"
      );
      const nivel2PerCountry = levelPerCountry.find(
        (level) =>
          level.country_iso3 === selectedCountry.iso3 && level.id === "2_1"
      );
      const options = [
        {
          name: nivel1PerCountry
            ? nivel1PerCountry[`name_${lang}`]
            : getTextById(copy, "switch_region", lang),

          value: "1",
        },
        {
          name: nivel2PerCountry
            ? nivel2PerCountry[`name_${lang}`]
            : getTextById(copy, "switch_local", lang),
          value: "2",
        },
      ];
      setNiveles(options);
      if (selectedNivel.value === "1") {
        setSelectedNivel(options[0]);
      } else {
        setSelectedNivel(options[1]);
      }
    } else {
      const options = [
        {
          name: getTextById(copy, "switch_region", lang),
          value: "1",
        },
        {
          name: getTextById(copy, "switch_local", lang),
          value: "2",
        },
      ];
      setNiveles(options);
      if (selectedNivel.value === "1") {
        setSelectedNivel(options[0]);
      } else {
        setSelectedNivel(options[1]);
      }
    }
  }, [selectedCountry]);
  return (
    <div className="relative">
      <div className="flex gap-m absolute top-0 left-0 z-10 p-m">
        <div className="">
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
              ...countries.sort((a,b) => a["name_" + lang].localeCompare(b["name_" + lang])),
            ]}
            defaultAllLabel={getTextById(copy, "map_country_select", lang)}
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
            copy={copy}
            countryCoordinates={countryCoordinates}
            selectedNivel={selectedNivel}
            data={data}
            governments={governments}
            lang={lang}
            selectedCountryIso3={selectedCountry.iso3}
            indicator={indicator}
          />
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
}

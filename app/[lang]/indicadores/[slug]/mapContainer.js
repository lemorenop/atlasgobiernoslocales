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
  indicator,
  regions,
}) {
  const regionsOpt = regions.map((elm) => {
    elm.iso3 = elm.id;
    return elm;
  });
  const { governments } = useContext(IndicatorDataContext);
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
  const [countryLevels, setCountryLevels] = useState(null);
  const [selectedNivel, setSelectedNivel] = useState({
    name: getTextById(copy, "switch_local", lang),
    value: "2",
  });
  const [niveles, setNiveles] = useState([
    {
      name: getTextById(copy, "switch_region", lang),
      value: "1",
      disabled: false,
    },
    {
      name: getTextById(copy, "switch_local", lang),
      value: "2",
      disabled: false,
    },
  ]);
  useEffect(() => {
    fetchCoordinates();
    async function fetchCoordinates() {
      if (selectedCountry.iso3 !== "all") {
        const response = await fetch(`/api/countries/${selectedCountry.iso3}`);
        const geojson = await response.json();
        console.log(geojson);
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
          disabled: false,
        },
        {
          name: nivel2PerCountry[`name_${lang}`],
          value: "2",
          disabled: false,
        },
        {
          name: nivel3PerCountry[`name_${lang}`],
          value: "3",
          disabled: false,
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
    } else if (
      selectedCountry.iso3 === "SLV" ||
      selectedCountry.iso3 === "DOM" ||
      selectedCountry.iso3 === "HTI"
    ) {
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
          disabled: false,
        },
        {
          name: nivel3PerCountry[`name_${lang}`],
          value: "3",
          disabled: false,
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
          disabled: false,
        },
        {
          name: nivel2PerCountry
            ? nivel2PerCountry[`name_${lang}`]
            : getTextById(copy, "switch_local", lang),
          value: "2",
          disabled: false,
        },
      ];
      setNiveles(options);
      if (selectedNivel.value === "1") {
        setSelectedNivel(options[0]);
      } else {
        setSelectedNivel(options[1]);
      }
    } else {
      const levels = levelPerCountry.filter(
        (level) => level.country_iso3 === selectedCountry.iso3
      );
      const options = [
        {
          name: getTextById(copy, "switch_region", lang),
          value: "1",
          disabled:
            selectedCountry.iso3 === "all" ||
            Number.isInteger(selectedCountry.iso3)
              ? false
              : !levels.some((level) => level.id.includes("1_")),
        },
        {
          name: getTextById(copy, "switch_local", lang),
          value: "2",
          disabled:
            selectedCountry.iso3 === "all" ||
            Number.isInteger(selectedCountry.iso3)
              ? false
              : !levels.some((level) => level.id.includes("2_")),
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
    <div className="relative bg-background">
      <div className="flex max-md:flex-col max-md:w-full gap-m absolute max-md:top-[60px] top-0 left-0 z-10 p-m">
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
              ...regionsOpt,
              ...countries.sort((a, b) =>
                a["name_" + lang].localeCompare(b["name_" + lang])
              ),
            ]}
            defaultAllLabel={getTextById(copy, "map_country_select", lang)}
            onChange={setSelectedCountry}
            lang={lang}
          />
        </div>
        <div className="w-fit">
          <LevelSwitch
            handleChange={setSelectedNivel}
            value={selectedNivel}
            options={niveles}
          />
        </div>
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

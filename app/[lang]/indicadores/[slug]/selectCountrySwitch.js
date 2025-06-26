"use client";
import { useContext, useEffect, useState } from "react";
import { IndicatorDataContext } from "./indicatorDataProvider";
import Select from "@/app/[lang]/components/select";
import { getTextById } from "@/app/utils/textUtils";
import LevelSwitch from "./levelSwitch";
export default function SelectCountrySwitch({
  selectedCountry,
  setSelectedCountry,
  selectedNivel,
  setSelectedNivel,
  options,
  multiple,
  label,
}) {
  const { copy, lang, levelPerCountry } = useContext(IndicatorDataContext);

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
            Number.isInteger(selectedCountry.iso3) ||
            multiple
              ? false
              : !levels.some((level) => level.id.includes("1_")),
        },
        {
          name: getTextById(copy, "switch_local", lang),
          value: "2",
          disabled:
            selectedCountry.iso3 === "all" ||
            Number.isInteger(selectedCountry.iso3) ||
            multiple
              ? false
              : !levels.some((level) => level.id.includes("2_")),
        },
      ];
      setNiveles(options);
      if (!multiple) setSelectedNivel(options[1]);
    }
  }, [selectedCountry]);
  return (
    <>
      <div className={`font-bold text-navy ${selectedCountry?.iso3 === "all" || multiple ? "exclude-from-capture" : ""}`}>
        <Select
          label={label}
          multiple={multiple}
          id="iso3"
          selected={selectedCountry}
          options={options}
          defaultAllLabel={getTextById(copy, "map_country_select", lang)}
          onChange={setSelectedCountry}
          lang={lang}
        />
      </div>
      <div className="w-fit exclude-from-capture">
        <LevelSwitch
          handleChange={setSelectedNivel}
          value={selectedNivel}
          options={niveles}
        />
      </div>
    </>
  );
}

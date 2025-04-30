"use client";
import Select from "@/app/[lang]/components/select";
import { useEffect, useState } from "react";
export default function MapContainer({ regions, countries, levelPerCountry, lang }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [countryLevels, setCountryLevels] = useState(null);
  const [selectedNivel, setSelectedNivel] = useState(null);
  useEffect(() => {
    const countryLevels = levelPerCountry.filter(
      (level) => level.country_iso3 === selectedCountry.iso3 && (level.id==="1_1" || level.id==="2_1" || level.id==="3_1")
    );
    setCountryLevels(countryLevels);
  }, [selectedCountry]);
  return (
    <div>
      {/* <Select options={regions} label="Region" onChange={setSelectedRegion} /> */}
      <Select
        selected={selectedCountry}
        options={countries}
        label="Country"
        onChange={setSelectedCountry}
        lang={lang}
      />
      {/* <Select options={niveles} label="Nivel" onChange={setSelectedNivel} /> */}
    </div>
  );
}

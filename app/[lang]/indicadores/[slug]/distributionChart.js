"use client";
import SelectCountrySwitch from "./selectCountrySwitch";
import { useContext,useState } from "react";
import { IndicatorDataContext } from "./indicatorDataProvider";
import { getTextById } from "@/app/utils/textUtils";

export default function DistributionChart() {
  const { governments, countries,copy,lang } = useContext(IndicatorDataContext);
  const [selectedCountries, setSelectedCountries] = useState([
    {
      name_es: "Todos",
      name_en: "All",
      name_pt: "Todos",
      iso3: "all",
    },
  ]);
  const [selectedNivel, setSelectedNivel] = useState({
    name: getTextById(copy, "switch_local", lang),
    value: "2",
  });
  return (
    <div>
      <SelectCountrySwitch
        label={getTextById(copy, "map_country_select", lang)}
        selectedCountry={selectedCountries}
        setSelectedCountry={setSelectedCountries}
        selectedNivel={selectedNivel}
        setSelectedNivel={setSelectedNivel}
        options={[
          {
            options: [
              {
                name_es: "Todos",
                name_en: "All",
                name_pt: "Todos",
                iso3: "all",
              },
              ...countries,
            ],
          },
        ]}
        multiple={true}
      />
    </div>
  );
}

"use client";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import Expand from "@/app/[lang]/components/icons/expand";
import { useContext, useState, useEffect, useRef } from "react";
import { IndicatorDataContext } from "./indicatorDataProvider";
import { getTextById, formatValue } from "@/app/utils/textUtils";
import SelectCountrySwitch from "./selectCountrySwitch";
import * as d3 from "d3";

export default function ScatterPlot() {
  const { governments, lang, indicators, indicator, copy, countries } =
    useContext(IndicatorDataContext);
  const [selectedIndicator, setSelectedIndicator] = useState(indicators[0]);
  const [scatterData, setSatterData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    name_es: "Todos",
    name_en: "All",
    name_pt: "Todos",
    iso3: "all",
  });
  const [selectedNivel, setSelectedNivel] = useState({
    name: getTextById(copy, "switch_local", lang),
    value: "2",
  });
  const svgRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(
          `/api/indicators/${selectedIndicator.code}`
        )
          .then((res) => res.json())
          .then((res) => res.data);

        const result = { ...governments };
        Object.entries(response).forEach(([key, value]) => {
          if (result[key]) {
            result[key] = {
              ...result[key],
              value_2: value,
            };
          }
        });

        setSatterData(result);
      } catch (error) {
        setSatterData();
        console.error("Error loading government data:", error);
      }
    }

    if (governments) loadData();
  }, [selectedIndicator, governments]);
  console.log(selectedIndicator);
  useEffect(() => {
    if (!scatterData || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Filter data based on selected country and level
    const filteredData = Object.entries(scatterData)
      .filter(([_, data]) => {
        const countryMatch =
          selectedCountry.iso3 === "all" ||
          data.countryCode === selectedCountry.iso3;
        const levelMatch = data.nivel === selectedNivel.value;
        return countryMatch && levelMatch;
      })
      .map(([id, data]) => {
        // Convert percentage values to 0-100 range
        const x =
          indicator.unit_measure_id === "perc" ? data.value * 100 : data.value;
        const y =
          selectedIndicator.unit_measure_id === "perc"
            ? data.value_2 * 100
            : data.value_2;
        return {
          id,
          x,
          y,
          ...data,
        };
      });

    if (filteredData.length === 0) return;

    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const container = svgRef.current.parentElement;
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", container.clientWidth)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.x)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.y)])
      .range([height, 0]);

    // Format function for axis labels
    const formatAxisLabel = (d, unitMeasureId) => {
      if (unitMeasureId === "perc") return d;

      // Abbreviate large numbers
      if (d >= 1000000) {
        return (d / 1000000).toFixed(1) + "M";
      }
      if (d >= 1000) {
        return (d / 1000).toFixed(1) + "K";
      }
      return d;
    };

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat(formatAxisLabel, indicator.unit_measure_id)
      )
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-family", "Raleway")
      .attr("dx", "-.8em")
      .attr("dy", ".5em");

    // Remove X axis lines
    svg.selectAll(".domain, .tick line").remove();

    // Add Y axis
    svg
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat(formatAxisLabel, selectedIndicator.unit_measure_id)
      );

    // Remove Y axis lines
    svg.selectAll(".domain, .tick line").remove();

    // Add dots
    svg.append("g")
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "#55C7D5")
      .attr("stroke", "#004A80")
      .attr("stroke-width", 1)
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7).attr("stroke-width", 2);
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("stroke-width", 1);
      });

    // Add X axis label at the top
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-family", "Raleway")
      .style("font-size", "14px")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .text(
        `${indicator[`name_${lang}`]} ${
          indicator.unit_measure_id !== "hab"
            ? `(${formatValue(null, indicator.unit_measure_id, lang)})`
            : ""
        }`
      );

    // Add Y axis label at the right
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-family", "Raleway")
      .style("font-size", "14px")
      .attr("transform", `translate(${width + margin.right - 20}, ${height/2}) rotate(90)`)
      .text(
        `${selectedIndicator[`name_${lang}`]} ${
          selectedIndicator.unit_measure_id !== "hab"
            ? `(${formatValue(null, selectedIndicator.unit_measure_id, lang)})`
            : ""
        }`
      );
  }, [
    scatterData,
    selectedCountry,
    selectedNivel,
    indicator,
    selectedIndicator,
    lang,
  ]);

  return (
    <div className="flex flex-col gap-[24px] ">
      <div className="flex flex-col gap-[24px] md:max-w-[80%] mx-auto">
        <h2 className="text-navy text-h2 text-center font-bold [&_span]:text-cyan">
          {getTextById(copy, "correlation_title", lang, [
            ,
            {
              id: "indicator_name",
              replace: indicator[`name_${lang}`],
            },
          ])}{" "}
          <SelectIndicator
            selected={selectedIndicator}
            onChange={setSelectedIndicator}
            lang={lang}
            options={indicators}
            id="code"
          />
        </h2>
      </div>
      <div className="flex justify-between w-full gap-m">
        <SelectCountrySwitch
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
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
        />
      </div>
      <div className="overflow-x-auto bg-[#55C7D51A] border-1 border-[#55C7D5] p-m relative">
        <div className="w-full h-[400px]">
          <svg ref={svgRef}></svg>
        </div>
      </div>
    </div>
  );
}

function SelectIndicator({ selected, onChange, lang, options }) {
  return (
    <Listbox value={selected} onChange={onChange}>
      <ListboxButton
        className={` w-fit inline-flex items-center gap-2  text-cyan focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer  justify-between data-[open]:rotate-0 pb-xxs border-b-2 border-cyan`}
      >
        {selected[`name_${lang}`]}
        <Expand className="w-4 h-4 stroke-2 rotate-90 stroke-blue" />
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        style={{ maxHeight: "300px!important" }}
        className="w-80 origin-top-right transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 bg-white text-blue-CAF border-1 border-background uppercase description p-m flex flex-col font-bold max-h-[300px] overflow-y-auto z-20"
      >
        {options.map((option, index) => (
          <div key={index}>
            {options.map((opt) => (
              <ListboxOption
                key={opt.code}
                value={opt}
                className="group flex  items-center gap-2  py-1.5 px-3 select-none 
          hover:bg-blue-CAF hover:text-white p-xs cursor-pointer"
              >
                {opt[`name_${lang}`]}
              </ListboxOption>
            ))}
          </div>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}

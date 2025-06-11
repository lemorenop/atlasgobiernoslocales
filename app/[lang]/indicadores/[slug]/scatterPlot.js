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
import Share from "@/app/[lang]/components/share";
import Loader from "../../components/loader";
import { chartStyles } from "@/app/utils/chartStyles";
export default function ScatterPlot() {
  const { governments, lang, indicators, indicator, copy, countries } =
    useContext(IndicatorDataContext);
  const [selectedIndicator, setSelectedIndicator] = useState(indicators[0].code!==indicator.code ? indicators[0] : indicators[1]);
  const [scatterData, setSatterData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    name_es: "Todos",
    name_en: "All",
    name_pt: "Todos",
    iso3: "all",
  });
  const [noData, setNoData] = useState(false);
  const [selectedNivel, setSelectedNivel] = useState({
    name: getTextById(copy, "switch_local", lang),
    value: "2",
  });
  const [tooltip, setTooltip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
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
        setNoData(true);
        setSatterData();
        console.error("Error loading government data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (governments) loadData();
  }, [selectedIndicator, governments]);
  //   console.log(governments.ARG10);
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
        return countryMatch && levelMatch && data.value && data.value_2;
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

    if (filteredData.length === 0) {
      setNoData(true);
      return;
    }
    setNoData(false);

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
        const value = d / 1000000;
        return Number.isInteger(value) ? value + "M" : value.toFixed(1) + "M";
      }
      if (d >= 1000) {
        const value = d / 1000;
        return Number.isInteger(value) ? value + "K" : value.toFixed(1) + "K";
      }
      return Number.isInteger(d) ? d : d.toFixed(1);
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
      .style("font-family", chartStyles.fontFamily)
      .style("color", chartStyles.textColor)
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
      )
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-family", chartStyles.fontFamily)
      .style("color", chartStyles.textColor)
      .attr("dx", "-.8em")
      .attr("dy", ".5em");

    // Remove Y axis lines
    svg.selectAll(".domain, .tick line").remove();

    // Add center lines
    // Vertical line
    const lineColor = chartStyles.dashLineColor;

    svg
      .append("line")
      .attr("x1", width / 2)
      .attr("y1", 0)
      .attr("x2", width / 2)
      .attr("y2", height)
      .attr("stroke", lineColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Horizontal line
    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", height / 2)
      .attr("x2", width)
      .attr("y2", height / 2)
      .attr("stroke", lineColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    // Add dots
    svg
      .append("g")
      .selectAll("circle")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5)
      .attr("fill", chartStyles.areaColor)
      .attr("stroke", chartStyles.lineColor)
      .attr("stroke-width", 1)
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        const tooltipContent = {
          title: `${d.name}, ${d.completeName}`,
          valueInd1: formatValue(d.x, indicator.unit_measure_id, lang, true),
          valueInd2: formatValue(
            d.y,
            selectedIndicator.unit_measure_id,
            lang,
            true
          ),
          government_id: d.id,
        };
        setTooltip({
          ...tooltipContent,
          x: event.pageX,
          y: event.pageY,
        });
        d3.select(this).attr("r", 7).attr("stroke-width", 2);
      })
      .on("mousemove", function (event, d) {
        const tooltipContent = {
          title: `${d.name}, ${d.completeName}`,
          valueInd1: formatValue(d.x, indicator.unit_measure_id, lang, true),
          valueInd2: formatValue(
            d.y,
            selectedIndicator.unit_measure_id,
            lang,
            true
          ),
          government_id: d.id,
        };
        setTooltip({
          ...tooltipContent,
          x: event.pageX,
          y: event.pageY,
        });
      })
      .on("mouseout", function () {
        setTooltip(null);
        d3.select(this).attr("r", 5).attr("stroke-width", 1);
      })
      .attr("tabindex", 0)
      .on("focus", function (event, d) {
        const tooltipContent = {
          title: `${d.name}, ${d.completeName}`,
          valueInd1: formatValue(d.x, indicator.unit_measure_id, lang, true),
          valueInd2: formatValue(
            d.y,
            selectedIndicator.unit_measure_id,
            lang,
            true
          ),
          government_id: d.id,
        };
        setTooltip({
          ...tooltipContent,
          x: event.pageX,
          y: event.pageY,
        });
      })
      .on("blur", function () {
        setTooltip(null);
      });

    // Add X axis label at the top
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-family", chartStyles.fontFamily)
      .style("font-size", "14px")
      .style("color", chartStyles.textColor)
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .text(
        `${indicator[`name_${lang}`]} ${
          indicator.unit_measure_id !== "hab" && indicator.unit_measure_id !== "num"
            ? `(${formatValue(null, indicator.unit_measure_id, lang)})`
            : ""
        }`
      );

    // Add Y axis label at the right
    svg
      .append("text")
      .attr("text-anchor", "middle")
        .style("font-family", chartStyles.fontFamily)
      .style("font-size", "14px")
      .style("color", chartStyles.textColor)
      .attr(
        "transform",
        `translate(${width + margin.right - 20}, ${height / 2}) rotate(90)`
      )
      .text(
        `${selectedIndicator[`name_${lang}`]} ${
          selectedIndicator.unit_measure_id !== "hab" && selectedIndicator.unit_measure_id !== "num"
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
    <div className="flex flex-col gap-xl ">
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
      <div className="overflow-x-auto bg-[#55C7D51A] border-1 border-[#55C7D54D] p-m relative">
        {isLoading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader className="w-10 h-10  min-w-10 min-h-10 [&_span]:w-full [&_span]:h-full" />
          </div>
        ) : (
          <div className="w-full h-[400px]">
            <svg ref={svgRef}></svg>
          </div>
        )}
        {noData && (
          <p
            style={{ top: "40%" }}
            className="text-center text-black right-0 left-0 absolute h-fit m-auto"
          >
            {getTextById(copy, "no_data", lang)}
          </p>
        )}
      </div>
      <div className="max-w-[300px]">
        <Share
          color="#004a80"
          shareText={`${indicator[`name_${lang}`]} `}
          shareTitle={getTextById(copy, "share", lang)}
        />
      </div>

      {tooltip && (
        <div
          className="tooltip w-fit inline-block z-20 absolute bg-white pointer-events-none"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            border: "1px solid #212529",
            padding: "16px",
            maxWidth: "350px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            opacity: 1,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <p className="font-bold pb-xs">{tooltip.title}</p>
          <div className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs">
              <p>
                {indicator[`name_${lang}`]}: {tooltip.valueInd1}
              </p>
            </div>
            <div className="flex items-center gap-xs">
              <p>
                {selectedIndicator[`name_${lang}`]}: {tooltip.valueInd2}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectIndicator({ selected, onChange, lang, options }) {
  return (
    <Listbox value={selected} onChange={onChange}>
      <ListboxButton
        className={` w-fit inline-flex items-center gap-2  text-cyan focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer  justify-between data-[open]:rotate-0 pb-1 border-b-2 border-cyan`}
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
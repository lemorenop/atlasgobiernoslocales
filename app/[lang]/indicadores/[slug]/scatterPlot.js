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
import Tooltip from "@/app/[lang]/components/tooltip";
import Download from "../../components/download";

export default function ScatterPlot() {
  const { governments, lang, indicators, indicator, copy, countries,regions } =
    useContext(IndicatorDataContext);
  const [selectedIndicator, setSelectedIndicator] = useState(
    indicators[0].code !== indicator.code ? indicators[0] : indicators[1]
  );

  const [scatterData, setSatterData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState({
    name_es: "Todos",
    name_en: "All",
    name_pt: "Todos",
    iso3: "all",
  });
  const [currentData,setCurrentData] = useState(null)

  // Función para estructurar los datos del scatter plot para CSV
  const getScatterPlotDataForCSV = () => {
    
    if (!currentData || !indicator || !selectedIndicator) {
      return null;
    }

    // Crear la fila de encabezados
    const headers = [
      lang === "es" ? "Gobierno" : lang === "en" ? "Government" : "Governo",
      lang === "es" ? "País" : lang === "en" ? "Country" : "País",
      indicator[`name_${lang}`],
      selectedIndicator[`name_${lang}`],
    ];

    // Usar los datos filtrados actuales
    const rows = currentData.map(data => {
      const value1 = formatValue(data.x, indicator.unit_measure_id, lang, true);
      const value2 = formatValue(data.y, selectedIndicator.unit_measure_id, lang, true);

      return [`${data.name}-${data.completeName}`, data.countryName, value1, value2];
    });

    return [headers, ...rows];
  };


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
  useEffect(() => {
    if (!scatterData || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Filter data based on selected country/region and level
    const filteredData = Object.entries(scatterData)
      .filter(([_, data]) => {
        let countryMatch = false;
        
        if (selectedCountry.iso3 === "all") {
          countryMatch = true;
        } else if (isNaN(selectedCountry.iso3)) {
          // It's a country (iso3 is a string)
          countryMatch = data.countryCode === selectedCountry.iso3;
        } else {
          // It's a region (iso3 is a number)
          // Find countries that belong to this region
          const regionCountries = countries.filter(country => 
            country.region_id === parseInt(selectedCountry.iso3)
          );
          const regionCountryCodes = regionCountries.map(country => country.iso3);
          countryMatch = regionCountryCodes.includes(data.countryCode);
        }
        
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
      setCurrentData(filteredData)
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
      .attr("stroke", chartStyles.blueColor)
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
      .on("click", function (event, d) {
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
        d3.select(this).attr("r", 7).attr("stroke-width", 2);
      })
      .on("blur", function () {
        setTooltip(null);
        d3.select(this).attr("r", 5).attr("r", 5).attr("stroke-width", 1);
      });

    // Add X axis label at the bottom
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .style("font-family", chartStyles.fontFamily)
      .style("font-size", "14px")
      .style("color", chartStyles.textColor)
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 3*2)
      .text(
        `${indicator[`name_${lang}`]} ${
          indicator.unit_measure_id !== "hab" &&
          indicator.unit_measure_id !== "num"
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
          selectedIndicator.unit_measure_id !== "hab" &&
          selectedIndicator.unit_measure_id !== "num"
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
    countries,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setTooltip(null);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="flex flex-col gap-xl px-l md:px-[160px] " id="scatter-plot">
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
            options={indicators.filter(
              (ind) => ind.code !== indicator.code && ind.code !== 25
            )}
            id="code"
          />
        </h2>
      </div>
      <div className={`flex justify-between w-full gap-m max-md:flex-col`}>
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
               
              ],
            },{
              group_title:getTextById(copy, "regions", lang),
              options:regions
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
      <div className="flex justify-between max-md:flex-col gap-[24px]">
        <div className="max-w-[300px]">
          <Share
            color="#004a80"
            shareText={`${indicator[`name_${lang}`]} `}
            shareTitle={getTextById(copy, "share", lang)}
          />
        </div>
        <div className="max-sm:w-full md:w-80">
          <Download
            chartDataFunction={getScatterPlotDataForCSV}
            downloadName={`${selectedIndicator[`name_${lang}`]}-${
              indicator[`name_${lang}`]
            }`}
            lang={lang}
            copy={copy}
            refImage={"scatter-plot"}
            buttonId="scatter-plot"
          />
        </div>
      </div>
      {tooltip && (
        <Tooltip tooltip={tooltip}>
          <>
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
          </>
        </Tooltip>
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
        <Expand className="w-4 h-4 stroke-2 rotate-90 stroke-blue exclude-from-capture" />
      </ListboxButton>
      <ListboxOptions
        anchor="bottom"
        transition
        style={{ maxHeight: "300px!important" }}
        className="w-80 origin-top-right transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 bg-white text-blue-CAF border-1 border-background uppercase description p-m flex flex-col font-bold max-h-[300px] overflow-y-auto z-20"
      >
        {/* {options.map((option, index) => (
          <div key={index}> */}
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
        {/* </div>
        ))} */}
      </ListboxOptions>
    </Listbox>
  );
}

"use client";
import SelectCountrySwitch from "./selectCountrySwitch";
import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { IndicatorDataContext } from "./indicatorDataProvider";
import {
  getTextById,
  formatValue,
  formatAxisLabel,
} from "@/app/utils/textUtils";
import * as d3 from "d3";
import { chartStyles } from "@/app/utils/chartStyles";
import Loader from "@/app/[lang]/components/loader";
import Share from "@/app/[lang]/components/share";
import Tooltip from "@/app/[lang]/components/tooltip";
import Download from "@/app/[lang]/components/download";

export default function DistributionChart() {
  const { governments, countries, copy, lang, regions, indicator } =
    useContext(IndicatorDataContext);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const [ranges, setRanges] = useState(null);
  const logIndicator =
    indicator.code === 1 || indicator.code === 2 || indicator.code === 3;
  const percRanges = [
    { bin: 0, min: 0, max: 10 },
    { bin: 1, min: 10, max: 20 },
    { bin: 2, min: 20, max: 30 },
    { bin: 3, min: 30, max: 40 },
    { bin: 4, min: 40, max: 50 },
    { bin: 5, min: 50, max: 60 },
    { bin: 6, min: 60, max: 70 },
    { bin: 7, min: 70, max: 80 },
    { bin: 8, min: 80, max: 90 },
    { bin: 9, min: 90, max: 100 },
  ];
  const svgRef = useRef();
  async function getLogs() {
    console.log("🔎 Busco logValues en /api/log-values");
    const d = await fetch(`/api/log-values`)
      .then((res) => res.json())
      .then((res) =>
        res.data.filter((elm) => elm.indicator_code === indicator.code)
      );
    setRanges(d);
  }
  useEffect(() => {
    if ([1, 2, 3].includes(indicator.code)) {
      getLogs();
    } else setRanges(percRanges);
  }, []);
  // Process data to get distribution by country and level
  const data = useMemo(() => {
    if (!governments || !ranges) return {};

    const result = {};
    
    const gaps = ranges;
    console.log(gaps)
    // Group jurisdictions by country and level
    Object.values(governments).forEach((jurisdiction) => {
      if (
        jurisdiction.value === undefined ||
        jurisdiction.value === null ||
        !jurisdiction.countryCode ||
        !jurisdiction.nivel
      )
        return;

      const countryCode = jurisdiction.countryCode;
      if (countryCode === "PER" && jurisdiction.nivel === "2") return;
      // Para peru mostramos el nivel 3 en lugar del 2
      const level =
        countryCode === "PER" && jurisdiction.nivel === "3"
          ? 2
          : jurisdiction.nivel;

      const value = jurisdiction.value;

      // Initialize country and level if not exists
      if (!result[countryCode]) {
        result[countryCode] = {
          1: { total: 0, ranges: {} },
          2: { total: 0, ranges: {} },
        };
      }

      // Ensure the level exists
      if (!result[countryCode][level]) {
        result[countryCode][level] = { total: 0, ranges: {} };
      }

      // Increment total for this country and level
      result[countryCode][level].total++;

      // Find the appropriate range for this value (convert from 0-1 to 0-100)
      const valuePercent = logIndicator ? value : value * 100;
      console.log(valuePercent)
      const gap = gaps.find((g) => {
       
        if(logIndicator) return valuePercent >= g.min && valuePercent < g.max && g.level == level
        else return (
          (g.min===0?valuePercent >= g.min:valuePercent > g.min) && valuePercent <= g.max
          
        );
      });

      let rangeKey = `${gap.bin}`;

      result[countryCode][level].ranges[rangeKey] =
        (result[countryCode][level].ranges[rangeKey] || 0) + 1;
    });
    // Calculate percentages for each range
    Object.keys(result).forEach((countryCode) => {
      ["1", "2"].forEach((level) => {
        const levelData = result[countryCode][level];
        if (levelData && levelData.total > 0) {
          Object.keys(levelData.ranges).forEach((range) => {
            levelData.ranges[range] =
              (levelData.ranges[range] / levelData.total) * 100;
          });
        }
      });
    });

    return result;
  }, [governments,ranges]);
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

  const getChartData = useCallback(() => {
    if (!data || !ranges) return [];

    const countriesToShow = selectedCountries.some((c) => c.iso3 === "all")
      ? countries
      : selectedCountries;

    const rangePerLevel = ranges.filter((r) =>
      r.level ? r.level === parseInt(selectedNivel.value) : true
    );
    return countriesToShow
      .map((country) => {
        const countryData = data[country.iso3]?.[selectedNivel.value];
        // Only include countries that have data for the selected level
        if (!countryData || Object.keys(countryData.ranges).length === 0)
          return null;

        // Create an object with all ranges, using the actual values or 0
        const rangeValues = rangePerLevel.reduce((acc, range) => {
          acc[`${range.bin}`] = countryData.ranges[`${range.bin}`] || 0;
          return acc;
        }, {});
        return {
          country: country[`name_${lang}`],
          countryCode: country.iso3,
          ...rangeValues,
        };
      })
      .filter(Boolean);
  }, [data, selectedCountries, selectedNivel, countries, lang, ranges]);

  // Get available countries for the selected level
  const getAvailableCountries = useCallback(() => {
    if (!data) return [];

    return countries.map((country) => {
      const hasData = data[country.iso3]?.[selectedNivel.value].total > 0;
      return {
        ...country,
        disabled: !hasData,
      };
    });
  }, [data, selectedNivel, countries]);

  // Find the maximum value for scaling
  const maxValue = useMemo(() => {
    if (!getChartData().length) return 100;
    const max = Math.max(
      ...getChartData().flatMap((country) =>
        Object.entries(country)
          .filter(([key]) => key !== "country" && key !== "countryCode")
          .map(([_, value]) => value)
      )
    );
    // Round up to the next multiple of 5 for cleaner axis
    return Math.ceil(max / 5) * 5;
  }, [getChartData]);

  useEffect(() => {
    const chartData = getChartData();
    if (!chartData.length || !svgRef.current) return;
    setIsLoading(false);

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    const isMobile = svgRef.current.clientWidth < 600;
    // Set up dimensions
    const margin = {
      top: 20,
      right: isMobile ? 0 : 10,
      bottom: 40,
      left: isMobile ? 50 : 150,
    };
    const countryHeight = 40;
    const rowSpacing = 3; // Espaciado entre filas
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = chartData.length * (countryHeight + rowSpacing) + margin.top + margin.bottom; 
    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    // Create scales
   const currentRanges = ranges.filter((r) =>
    r.level ? r.level === parseInt(selectedNivel.value) : true
  );
    const x = d3
      .scaleBand()
      .domain(
        currentRanges
          .map((r) => r.bin)
      )
      .range([0, width])
      .padding(0.1);

    // Add single X axis at the bottom
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom-10})`)
      .call(
        d3.axisBottom(x).tickFormat((d, i) => {
          // Show all range labels
          const range = currentRanges.find((r) => r.bin === d);
          return `${!range.max && logIndicator ? "+" : ""}${formatAxisLabel(
            logIndicator?range.min:range.min===0?0:range.min+1,
            indicator.unit_measure_id
          )}${
            range.max
              ? `-${formatAxisLabel(range.max, indicator.unit_measure_id)}`
              : ""
          }${!logIndicator ? "%" : ""}`;
        })
      )
      .selectAll("text")
      .attr("transform", `rotate(${logIndicator ? -15 : 0}, 0, 0)`)
      .style("text-anchor", "middle")
      .style("font-family", chartStyles.fontFamily)
      .style("color", chartStyles.textColor)
      .style("font-size", isMobile ? "10px" : chartStyles.fontSize);

    // Remove the axis line and ticks
    g.selectAll(".domain, .tick line").remove();

    // Create a group for each country
    chartData.forEach((country, i) => {
     
      const countryGroup = g
        .append("g")
        .attr("transform", `translate(0,${i * (countryHeight + rowSpacing)})`);
      // Create scales for this country
      const y = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([countryHeight, 0]);

      // Add dotted line between countries (except for the first country)

      countryGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", y(0))
        .attr("x2", width)
        .attr("y2", y(0))
        .attr("stroke", chartStyles.lightCyanColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

      // Add vertical dotted lines for each X tick
      x.domain().forEach((tick) => {
        const xPos = x(tick) + x.bandwidth() / 2;
        countryGroup
          .append("line")
          .attr("x1", xPos)
          .attr("y1", 0)
          .attr("x2", xPos)
          .attr("y2", countryHeight)
          .attr("stroke", chartStyles.lightCyanColor)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4");
      });

      // Transform data for this country
      const countryData = Object.entries(country)
        .filter(([key]) => key !== "country" && key !== "countryCode")
        .map(([range, value]) => ({
          range,
          value: y(value),
          originalValue: value,
        }));
      // Add country name
      const countryNameText = countryGroup
        .append("text")
        .attr("x", isMobile ? 2 : -10)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .style("font-family", chartStyles.fontFamily)
        .style("font-size", isMobile ? "10px" : chartStyles.fontSize)
        .style("color", chartStyles.textColor)
        .attr("transform", isMobile ? "rotate(-15, -10, 20)" : "");
      if (isMobile && country.country.includes(" ")) {
        // Split country name into words
        const words = country.country.split(" ");
        const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(" ");
        const secondLine = words.slice(Math.ceil(words.length / 2)).join(" ");

        countryNameText
          .append("tspan")
          .attr("x", isMobile ? 2 : -10)
          .attr("dy", "0")
          .text(firstLine);

        countryNameText
          .append("tspan")
          .attr("x", isMobile ? 2 : -10)
          .attr("dy", "1.2em")
          .text(secondLine);
      } else {
        countryNameText.text(country.country);
      }

      countryData.forEach((d) => {
        const range = ranges.find((r) => r.bin === parseInt(d.range));
        const tooltipContent = {
          title: country.country,
          range: `${!range.max && logIndicator ? "+" : ""}${formatAxisLabel(
            range.min,
            indicator.unit_measure_id
          )}${
            range.max
              ? `-${formatAxisLabel(range.max, indicator.unit_measure_id)}`
              : ""
          }${!logIndicator ? "%" : ""}`,
          value: formatValue(d.originalValue, "perc", lang),
        };
        // Área de interacción invisible (más ancha para facilitar hover)
        countryGroup
          .append("rect")
          .attr("x", x(parseInt(d.range)) - 2)
          .attr("y", 0)
          .attr("width", x.bandwidth() + 4)
          .attr("height", countryHeight)
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseover", (event) => {
            // Resaltar la barra correspondiente
            d3.select(event.target.parentNode)
              .select(`rect[data-range="${d.bin}"]`)
              .attr("stroke", chartStyles.blueColor);

            setTooltip({
              ...tooltipContent,
              x: event.pageX,
              y: event.pageY + 3,
            });
          })
          .on("mousemove", (event) => {
            setTooltip({
              ...tooltipContent,
              x: event.pageX,
              y: event.pageY + 3,
            });
          })
          .on("mouseout", function () {
            // Restaurar el color de la barra
            d3.select(event.target.parentNode)
              .select(`rect[data-range="${d.range}"]`)
              .attr("stroke", chartStyles.cyanColor);
            setTooltip(null);
          });

        // Barra visual
        countryGroup
          .append("rect")
          .attr("data-range", d.range)
          .attr("x", x(parseInt(d.range)))
          .attr("y", y(0))
          .attr("width", x.bandwidth())
          .attr("height", 0)
          .attr("fill", chartStyles.cyanColor)
          .attr("stroke", chartStyles.cyanColor)
          .attr("stroke-width", 1)
          .style("pointer-events", "none")
          .transition()
          .duration(1000)
          .delay((d, i) => i * 100) // Stagger the animations
          .ease(d3.easeQuadOut)
          .attr("y", d.value)
          .attr("height", y(0) - d.value);
      });
    });
  }, [getChartData, maxValue,selectedNivel]);

  // Hide tooltip on scroll
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
    <div
      className="flex flex-col gap-xl px-l md:px-[160px]"
      id="distribution-chart"
    >
      <div className="flex flex-col gap-[24px] md:max-w-[80%] mx-auto">
        <h2 className="text-navy text-h2 text-center font-bold [&_span]:text-cyan">
          {getTextById(copy, "distribution_title", lang, [
            ,
            {
              id: "indicator_name",
              replace: indicator[`name_${lang}`],
            },
          ])}{" "}
        </h2>
        <p className="[&_span]:text-cyan text-p text-center [&_span]:font-bold">
          {getTextById(copy, "distribution_subtitle", lang, [
            ,
            {
              id: "indicator_name",
              replace: indicator[`name_${lang}`],
            },
            { id: "level_name", replace: selectedNivel.name },
          ])}
        </p>
      </div>
      <div className="flex justify-between w-full gap-m max-md:flex-col ">
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
              ],
            },
            {
              group_title: getTextById(copy, "regions", lang),
              options: regions,
            },
            {
              group_title: getTextById(copy, "countries", lang),
              options: getAvailableCountries(),
            },
          ]}
          multiple={true}
        />
      </div>
      <div className="overflow-x-auto bg-[#55C7D51A] border-1 border-[#55C7D54D] p-m relative">
        <div className="w-full">
          {isLoading && (
            <div className="flex justify-center items-center h-[400px]">
              <Loader className="w-10 h-10  min-w-10 min-h-10 [&_span]:w-full [&_span]:h-full" />
            </div>
          )}
          <svg ref={svgRef} className="w-full"></svg>
        </div>
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
            disabled={isLoading}
            downloadName={`${indicator[`name_${lang}`]}-distribution-${
              selectedNivel.name
            }`}
            lang={lang}
            copy={copy}
            refImage={"distribution-chart"}
            buttonId="distribution-chart"
          />
        </div>{" "}
      </div>
      {tooltip && (
        <Tooltip tooltip={tooltip}>
          <>
            <p className="font-bold pb-xs">{tooltip.title}</p>
            <div className="flex items-center gap-xs">
              <p>
                {getTextById(copy, "distribution_tooltip", lang, [
                  ,
                  {
                    id: "range",
                    replace: tooltip.range,
                  },
                  {
                    id: "value",
                    replace: tooltip.value,
                  },
                  {
                    id: "indicator_name",
                    replace: indicator[`name_${lang}`],
                  },
                ])}
              </p>
            </div>
          </>
        </Tooltip>
      )}
    </div>
  );
}

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
import { getTextById, formatValue } from "@/app/utils/textUtils";
import * as d3 from "d3";
import { chartStyles } from "@/app/utils/chartStyles";
import Loader from "@/app/[lang]/components/loader";
import Share from "@/app/[lang]/components/share";
import Tooltip from "@/app/[lang]/components/tooltip";
import Download from "../../components/download";

export default function DistributionChart() {
  const { governments, countries, copy, lang, regions, indicator } =
    useContext(IndicatorDataContext);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef();
  // Function to create value ranges
  const createValueRanges = () => {
    const ranges = [];
    // Create ranges from 0 to 90
    for (let i = 0; i < 0.9; i += 0.1) {
      ranges.push({
        min: i,
        max: i + 0.1,
        label: `${(i * 100).toFixed(0)}-${((i + 0.1) * 100).toFixed(0)}`,
      });
    }
    // Add the final range for 90-100
    ranges.push({
      min: 0.9,
      max: 1.0,
      label: "90-100",
    });
    return ranges;
  };

  // Process data to get distribution by country and level
  const data = useMemo(() => {
    if (!governments) return {};

    const ranges = createValueRanges();
    const result = {};

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

      const value = Math.min(jurisdiction.value, 1);

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

      // Find the appropriate range for this value
      const range = ranges.find((r) => value >= r.min && value <= r.max);
      if (range) {
        const rangeKey = range.label;
        result[countryCode][level].ranges[rangeKey] =
          (result[countryCode][level].ranges[rangeKey] || 0) + 1;
      }
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
  }, [governments]);
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
    if (!data) return [];

    const countriesToShow = selectedCountries.some((c) => c.iso3 === "all")
      ? countries
      : selectedCountries;

    // Get all possible ranges
    const allRanges = [
      "0-10",
      "10-20",
      "20-30",
      "30-40",
      "40-50",
      "50-60",
      "60-70",
      "70-80",
      "80-90",
      "90-100",
    ];

    return countriesToShow
      .map((country) => {
        const countryData = data[country.iso3]?.[selectedNivel.value];
        // Only include countries that have data for the selected level
        if (!countryData || Object.keys(countryData.ranges).length === 0)
          return null;

        // Create an object with all ranges, using the actual values or 0
        const rangeValues = allRanges.reduce((acc, range) => {
          acc[range] = countryData.ranges[range] || 0;
          return acc;
        }, {});

        return {
          country: country[`name_${lang}`],
          countryCode: country.iso3,
          ...rangeValues,
        };
      })
      .filter(Boolean);
  }, [data, selectedCountries, selectedNivel, countries, lang]);

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
    if (!getChartData().length || !svgRef.current) return;
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
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = getChartData().length * 40 + margin.top + margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    // Create scales

    const x = d3
      .scaleBand()
      .domain([
        "0-10",
        "10-20",
        "20-30",
        "30-40",
        "40-50",
        "50-60",
        "60-70",
        "70-80",
        "80-90",
        "90-100",
      ])
      .range([0, width])
      .padding(0.1);

    // Create line generator
    const line = d3
      .line()
      .x((d) => x(d.range) + x.bandwidth() / 2)
      .y((d) => d.value)
      .curve(d3.curveMonotoneX);

    // Add single X axis at the bottom
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x).tickFormat((d, i) => {
          // Show only 0, 50, and 100 at their corresponding positions
          if (d === "0-10") return "0%";
          if (d === "40-50") return "50%";
          if (d === "90-100") return "100%";
          return "";
        })
      )
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-family", chartStyles.fontFamily)
      .style("color", chartStyles.textColor)
      .style("font-size", isMobile ? "10px" : chartStyles.fontSize);

    // Remove the axis line and ticks
    g.selectAll(".domain, .tick line").remove();

    // Create a group for each country
    getChartData().forEach((country, i) => {
      const countryHeight = 40;
      const countryGroup = g
        .append("g")
        .attr("transform", `translate(0,${i * countryHeight})`);

      // Add dotted line between countries (except for the first country)
      if (i > 0) {
        countryGroup
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", width)
          .attr("y2", 0)
          .attr("stroke", chartStyles.lightCyanColor)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4");
      }

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

      // Create scales for this country
      const y = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([countryHeight, 0]);

      // Create area generator for this country
      const clickArea = d3
        .area()
        .x((d) => x(d.range) + x.bandwidth() / 2)
        .y0((d) => y(0))
        .y1((d) => y(maxValue))
        .curve(d3.curveMonotoneX);
      const startArea = d3
        .area()
        .x((d) => x(d.range))
        .y0((d) => y(0))
        .y1((d) => y(0))
        .curve(d3.curveMonotoneX);
      const area = d3
        .area()
        .x((d) => x(d.range) + x.bandwidth() / 2)
        .y0((d) => y(0))
        .y1((d) => d.value)
        .curve(d3.curveMonotoneX);

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

      // Transform data for this country
      const countryData = Object.entries(country)
        .filter(([key]) => key !== "country" && key !== "countryCode")
        .map(([range, value]) => ({
          range,
          value: y(value),
          originalValue: value,
        }));
      function handleTooltip(event, d) {
        d3.select(`#${country.countryCode}`).attr(
          "stroke",
          chartStyles.blueColor
        );
        const xPos = d3.pointer(event)[0];
        const range = x.domain().find((range) => {
          const rangeX = x(range);
          const rangeEnd = rangeX + x.bandwidth();
          return xPos >= rangeX && xPos < rangeEnd;
        });

        if (range) {
          const value = countryData.find((d) => d.range === range);
          const tooltipContent = {
            title: country.country,
            range: range,
            value: formatValue(
              value.originalValue,
              indicator.unit_measure_id,
              lang
            ),
          };
          setTooltip({
            ...tooltipContent,
            x: event.pageX,
            y: event.pageY,
          });
        }
      }
      // Add the area
      countryGroup
        .append("path")
        .datum(countryData)
        .attr("fill", chartStyles.lightCyanColor)
        .style("cursor", "pointer")
        .attr("d", startArea)
        .transition()
        .duration(750)
        .ease(d3.easeQuadInOut)
        .attr("d", area);

      // Add the line on top
      countryGroup
        .append("path")
        .datum(countryData)
        .attr("id", country.countryCode)
        .attr("fill", "none")
        .attr("stroke", chartStyles.cyanColor)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("id", country.countryCode)
        .style("cursor", "pointer")
        .attr("stroke-dasharray", function () {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
      // if (isMobile)
      countryGroup
        .append("path")
        .attr("class", "click-area")
        .datum(countryData)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .attr("d", clickArea)
        .on("mouseover", handleTooltip)
        .on("mousemove", handleTooltip)
        .on("mouseout", function () {
          d3.select(`#${country.countryCode}`).attr(
            "stroke",
            chartStyles.cyanColor
          );
          setTooltip(null);
        })
        .on("click", function (event, d) {
          // Remove selected class from all paths
          d3.selectAll("path.click-area[stroke]").attr("stroke", "transparent");

          // Add selected class to clicked path and change color
          d3.select(this).attr("stroke", chartStyles.blueColor);

          handleTooltip(event, d);
        });
    });
  }, [getChartData, maxValue]);

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
              id: "nivel",
              replace:
                lang === "en"
                  ? selectedNivel.value === "2"
                    ? "Local"
                    : "Regional"
                  : selectedNivel.value === "2"
                  ? "local"
                  : "regional",
            },
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
            downloadName={`${indicator[`name_${lang}`]}-distribution-${selectedNivel.name}`}
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

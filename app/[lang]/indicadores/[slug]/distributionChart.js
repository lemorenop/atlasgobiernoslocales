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
import { getTextById } from "@/app/utils/textUtils";
import * as d3 from "d3";
import { chartStyles } from "@/app/utils/chartStyles";
import Loader from "@/app/[lang]/components/loader";
import Share from "@/app/[lang]/components/share";

export default function DistributionChart() {
  const { governments, countries, copy, lang, regions, indicator } =
    useContext(IndicatorDataContext);
  const [isLoading, setIsLoading] = useState(true);
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
      const level = jurisdiction.nivel;
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
          .filter(([key]) => key !== "country")
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

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
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
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-family", chartStyles.fontFamily)
      .style("color", chartStyles.textColor)
      .style("font-size", chartStyles.fontSize);

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
          .attr("stroke", "#55C7D54D")
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
          .attr("stroke", "#55C7D54D")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4");
      });

      // Create scales for this country
      const y = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([countryHeight, 0]);

      // Create area generator for this country
      const area = d3
        .area()
        .x((d) => x(d.range) + x.bandwidth() / 2)
        .y0((d) => y(0))
        .y1((d) => d.value)
        .curve(d3.curveMonotoneX);

      // Add country name
      countryGroup
        .append("text")
        .attr("x", -10)
        .attr("y", 20)
        .attr("text-anchor", "end")
        .style("font-family", chartStyles.fontFamily)
        .style("font-size", chartStyles.fontSize)
        .style("color", chartStyles.textColor)
        .text(country.country);

      // Transform data for this country
      const countryData = Object.entries(country)
        .filter(([key]) => key !== "country")
        .map(([range, value]) => ({
          range,
          value: y(value),
        }));

      // Add the area
      countryGroup
        .append("path")
        .datum(countryData)
        .attr("fill", chartStyles.areaColor)
        .attr("d", area);

      // Add the line on top
      countryGroup
        .append("path")
        .datum(countryData)
        .attr("fill", "none")
        .attr("stroke", chartStyles.lineColor)
        .attr("stroke-width", 2)
        .attr("d", line);
    });
  }, [getChartData, maxValue]);
  return (
    <div className="flex flex-col gap-xl ">
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
      <div className="flex justify-between w-full gap-m">
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
      <div className="max-w-[300px]">
        <Share
          color="#004a80"
          shareText={`${indicator[`name_${lang}`]} `}
          shareTitle={getTextById(copy, "share", lang)}
        />
      </div>
    </div>
  );
}

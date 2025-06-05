"use client";
import { useEffect, useRef, useState, useContext } from "react";
import * as d3 from "d3";
import { useParams } from "next/navigation";
import { getTextById } from "@/app/utils/textUtils";
import Info from "@/app/[lang]/components/icons/info";
import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import Loader from "@/app/[lang]/components/loader";
import { noDataColor } from "@/app/utils/mapSettings";
const govColor = "#1774AD";
const countryColor = "#55C7D5";
// const percentileColor = "#024067";

export default function RadarChart({ data, country, yearIndicators }) {
  const { government, indicators, jurisdictionsCopy } = useContext(
    JurisdictionDataContext
  );
  const [tooltip, setTootip] = useState();
  const params = useParams();
  const lang = params.lang; // Obtenemos el idioma directamente de los parámetros de la URL
  const svgRef = useRef(null);
  const indicatorsID = [21, 5, 7, 8, 13, 19, 10, 11, 12, 17, 20];

  const [nationalData, setNationalData] = useState(null);
  const [chartCreated, setChartCreated] = useState(false);
  // Fetch national averages
  useEffect(() => {
    if (!government || !government.country_iso3) return;

    const fetchNationalAverages = async () => {
      try {
        // setUnitMeasures(um);
        // Extraer el nivel del gobierno del level_per_country_id (el número antes del guión bajo)
        let nivel = null;
        if (government.level_per_country_id) {
          const levelParts = government.level_per_country_id.split("_");
          if (levelParts.length > 0) {
            nivel = levelParts[0];
          }
        }

        // Construir la URL con los parámetros de filtro
        let url = `/api/national-averages?country_iso3=${government.country_iso3}`;
        if (nivel) {
          url += `&nivel=${nivel}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch national averages");
        }
        const data = await response.json();

        setNationalData(data);
      } catch (error) {
        console.error("Error fetching national averages:", error);
        // Fallback to default values if fetch fails
        setNationalData(
          indicatorsID.map((id) => ({
            indicator_code: id,
            value: null,
            // unit_measure_id: unitMeasures.find((um) => um.id === id),
          }))
        );
      }
    };

    fetchNationalAverages();
  }, [government]);
  useEffect(() => {
    const updateChartDimensions = () => {
      if (!svgRef.current) {
        return;
      }
      const container = svgRef.current.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const margin = { top: 100, right: 60, bottom: 60, left: 60 }; // Add some margin for better spacing
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const innerRadius = radius * 0.15; // 30% of the outer radius for the inner circle

      // Update SVG dimensions
      d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .select("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Redraw the chart with new dimensions
      if (data && nationalData)
        drawChart(
          innerWidth,
          innerHeight,
          radius,
          innerRadius,
          margin,
          width,
          height
        );
    };

    const drawChart = (
      innerWidth,
      innerHeight,
      radius,
      innerRadius,
      margin,
      width,
      height
    ) => {
      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove();
      const isMobile = innerWidth < 650;
      const svg = d3
        .select(svgRef.current)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Create scales
      const angleScale = d3
        .scalePoint()
        .domain(indicatorsID)
        .range([0, 2 * Math.PI]);

      const radiusScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([innerRadius, radius]);

      // Escala para el radio de los círculos
      const circleRadiusScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([3, isMobile ? 4 : 6]);

      // Create background circles
      svg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);

      // Add inner circle
      svg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", innerRadius)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);

      // Create data points for government values
      const governmentData = indicatorsID.map((id) => {
        const dataPoint = data.find((d) => d.indicator_code === id);
        // Los valores del gobierno también están entre 0 y 1, multiplicamos por 100
        const value = dataPoint ? parseFloat(dataPoint.value) * 100 : null;

        return {
          indicator_code: id,
          value: isNaN(value) ? null : value, // Asegurarse de que sea un número válido
        };
      });

      // Process national average data
      const processedNationalData = indicatorsID.map((id) => {
        // Buscar usando el campo correcto del CSV (indicador_code)
        const natPoint = nationalData.find((d) => d.indicator_code === id);
        // Los valores están entre 0 y 1, multiplicamos por 100 para la escala del gráfico
        const value = natPoint ? parseFloat(natPoint.value) * 100 : null;
        // const p10 = natPoint ? parseFloat(natPoint.p10) * 100 : null;
        // const p90 = natPoint ? parseFloat(natPoint.p90) * 100 : null;

        return {
          indicator_code: id,
          value: isNaN(value) ? null : value,
          // p10: isNaN(p10) ? null : p10,
          // p90: isNaN(p90) ? null : p90,
        };
      });

      // Calculate the angle for each indicator
      const angleStep = (2 * Math.PI) / indicatorsID.length;

      // Draw segments for each indicator
      indicatorsID.forEach((indicator, i) => {
        const startAngle = i * angleStep;
        const endAngle = (i + 1) * angleStep;
        const midAngle = startAngle + (endAngle - startAngle) / 2;

        // // Calculate the position for the icon
        // const iconDistance = radius + 70; // Adjust distance as needed
        // const iconX = iconDistance * Math.cos(midAngle - Math.PI / 2);
        // const iconY = iconDistance * Math.sin(midAngle - Math.PI / 2);

        // Find the corresponding data points
        const govData = governmentData.find(
          (d) => d.indicator_code === indicator
        );
        const natData = processedNationalData.find(
          (d) => d.indicator_code === indicator
        );
        // Find the indicator name from the indicators prop based on the current language
        const indicatorInfo = indicators
          ? indicators.find((ind) => ind.code === indicator)
          : null;


        let indicatorName = `Ind ${indicator}`;
        let indDescription = null;
        if (indicatorInfo) {
          // Use the appropriate name based on the language
          if (lang === "es" && indicatorInfo.name_es) {
            indicatorName = indicatorInfo.name_es;
            indDescription = indicatorInfo.description_es;
          } else if (lang === "en" && indicatorInfo.name_en) {
            indicatorName = indicatorInfo.name_en;
            indDescription = indicatorInfo.description_en;
          } else if (lang === "pt" && indicatorInfo.name_pt) {
            indicatorName = indicatorInfo.name_pt;
            indDescription = indicatorInfo.description_pt;
          } else if (indicatorInfo.name) {
            // Fallback to the default name if available
            indicatorName = indicatorInfo.name;
            indDescription = indicatorInfo.description;
          }
        }

        const displayGovValue =
          govData.value != null
            ? `${parseFloat(govData.value).toFixed(0)} ${
                indicatorInfo.unit?.unit ? indicatorInfo.unit?.unit : ""
              }`
            : getTextById(jurisdictionsCopy, "no_data", lang);

        const displayNatValue =
          natData.value != null
            ? `${parseFloat(natData.value).toFixed(0)} ${
                indicatorInfo.unit?.unit ? indicatorInfo.unit?.unit : ""
              }`
            : getTextById(jurisdictionsCopy, "no_data", lang);

        // const displayP10Value =
        //   natData.p10 != null
        //     ? `${parseFloat(natData.p10).toFixed(0)} ${
        //         indicatorInfo.unit?.unit ? indicatorInfo.unit?.unit : ""
        //       }`
        //     : getTextById(jurisdictionsCopy, "no_data", lang);

        // const displayP90Value =
        //   natData.p90 != null
        //     ? `${parseFloat(natData.p90).toFixed(0)} ${
        //         indicatorInfo.unit?.unit ? indicatorInfo.unit?.unit : ""
        //       }`
        //     : getTextById(jurisdictionsCopy, "no_data", lang);

        const valuesTooltip = {
          title: indicatorName,
          valueNat: displayNatValue,
          valueGov: displayGovValue,
          // valueP10: displayP10Value,
          // valueP90: displayP90Value,
        };

        // Draw the segment background
        const arc = d3
          .arc()
          .innerRadius(innerRadius)
          .outerRadius(radius)
          .startAngle(startAngle)
          .endAngle(endAngle);

        svg
          .append("path")
          .attr("d", arc)
          .attr("fill", "rgba(231, 246, 248, 0.50)")
          .attr("stroke", "rgba(85, 199, 213, 0.15)")
          .attr("cursor", "pointer")
          .on("mousemove", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("mouseover", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("mouseout", function () {
            setTootip(null);
          })
          .attr("stroke-width", 1);

        // Calculamos ángulos separados para gobierno y promedio nacional
        const govAngleOffset = (endAngle - startAngle) * 0.25; // 25% desde el inicio
        const natAngleOffset = (endAngle - startAngle) * 0.75; // 75% desde el inicio

        // Ángulo para el valor del gobierno (1/4 del segmento)
        const govAngle = startAngle + govAngleOffset;
        const govX =
          radiusScale(govData.value || 0) * Math.cos(govAngle - Math.PI / 2);
        const govY =
          radiusScale(govData.value || 0) * Math.sin(govAngle - Math.PI / 2);

        // Ángulo para el promedio nacional (3/4 del segmento)
        const natAngle = startAngle + natAngleOffset;

        // Calcular el máximo valor entre promedio, p10 y p90 para la línea
        const maxValue = Math.max(
          natData.value || 0,
          // natData.p10 || 0,
          // natData.p90 || 0
        );

        const natX = radiusScale(maxValue) * Math.cos(natAngle - Math.PI / 2);
        const natY = radiusScale(maxValue) * Math.sin(natAngle - Math.PI / 2);

        // Calcular posiciones para p10 y p90
        // const p10X =
        //   radiusScale(natData.p10 || 0) * Math.cos(natAngle - Math.PI / 2);
        // const p10Y =
        //   radiusScale(natData.p10 || 0) * Math.sin(natAngle - Math.PI / 2);
        // const p90X =
        //   radiusScale(natData.p90 || 0) * Math.cos(natAngle - Math.PI / 2);
        // const p90Y =
        //   radiusScale(natData.p90 || 0) * Math.sin(natAngle - Math.PI / 2);

        // Calcular el punto de inicio para las líneas (perpendicular al círculo interior)
        const govStartX = innerRadius * Math.cos(govAngle - Math.PI / 2);
        const govStartY = innerRadius * Math.sin(govAngle - Math.PI / 2);
        const natStartX = innerRadius * Math.cos(natAngle - Math.PI / 2);
        const natStartY = innerRadius * Math.sin(natAngle - Math.PI / 2);

        // Línea para el valor del gobierno
        svg
          .append("line")
          .attr("x1", govStartX)
          .attr("y1", govStartY)
          .attr("x2", govX)
          .attr("y2", govY)
          .attr("stroke", countryColor)
          .attr("stroke-width", 2);

        // Línea para el valor nacional (ahora extendida al máximo valor)
        svg
          .append("line")
          .attr("x1", natStartX)
          .attr("y1", natStartY)
          .attr("x2", natX)
          .attr("y2", natY)
          .attr("stroke", govColor)
          .attr("stroke-width", 2);

        // Punto para el valor del gobierno
        svg
          .append("circle")
          .attr("cx", govX)
          .attr("cy", govY)
          .attr("r", circleRadiusScale(govData.value || 0))
          .attr("fill", govData.value != null ? countryColor : noDataColor)
          .attr("tabindex", 0)
          .on("focus", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("blur", function () {
            setTootip(null);
          });

        // Punto para p10
        // svg
        //   .append("circle")
        //   .attr("cx", p10X)
        //   .attr("cy", p10Y)
        //   .attr("r", circleRadiusScale(natData.p10 || 0))
        //   .attr("fill", natData.p10 != null ? percentileColor : noDataColor)
        //   .attr("tabindex", 0)
        //   .on("focus", function (event) {
        //     setTootip({
        //       ...valuesTooltip,
        //       x: event.pageX,
        //       y: event.pageY,
        //     });
        //   })
        //   .on("blur", function () {
        //     setTootip(null);
        //   });

        // Punto para p90
        // svg
        //   .append("circle")
        //   .attr("cx", p90X)
        //   .attr("cy", p90Y)
        //   .attr("r", circleRadiusScale(natData.p90 || 0))
        //   .attr("fill", natData.p90 != null ? percentileColor : noDataColor)
        //   .attr("tabindex", 0)
        //   .on("focus", function (event) {
        //     setTootip({
        //       ...valuesTooltip,
        //       x: event.pageX,
        //       y: event.pageY,
        //     });
        //   })
        //   .on("blur", function () {
        //     setTootip(null);
        //   });
        // Punto para el promedio nacional
        svg
          .append("circle")
          .attr(
            "cx",
            radiusScale(natData.value || 0) * Math.cos(natAngle - Math.PI / 2)
          )
          .attr(
            "cy",
            radiusScale(natData.value || 0) * Math.sin(natAngle - Math.PI / 2)
          )
          .attr("r", circleRadiusScale(natData.value || 0))
          .attr("fill", natData.value != null ? govColor : noDataColor)
          .attr("tabindex", 0)
          .on("focus", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("blur", function () {
            setTootip(null);
          });

        // Split the indicator name into two lines
        const words = indicatorName.split(" ");
        const midPoint = indicator === 8 ? 1 : Math.ceil(words.length / 2);
        const firstLine = words.slice(0, midPoint).join(" ");
        const longIndicators = [7, 8, 11, 19]; // indicadores con nombres largos
        const secondLine = longIndicators.includes(indicator)
          ? words.slice(midPoint, midPoint + 1).join(" ")
          : words.slice(midPoint).join(" ");
        const thirdLine = longIndicators.includes(indicator)
          ? words.slice(midPoint + 1).join(" ")
          : null;
        // Add label for the indicator (two lines)
        const labelDistance = radius + (isMobile ? 47 : 50); // Reduced distance to bring text closer
        const labelX =
          isMobile && indicator === 8
            ? labelDistance - 30
            : isMobile && indicator === 7
            ? labelDistance - 16
            : isMobile && indicator === 12
            ? -labelDistance + 18
            : isMobile && indicator === 11
            ? -labelDistance + 18
            : (midAngle < Math.PI / 2 || midAngle > (3 * Math.PI) / 2
                ? labelDistance + (isMobile ? 0 : 20) // Move right in top-right and bottom-right
                : labelDistance) * Math.cos(midAngle - Math.PI / 2);
        const labelY =
          (midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2
            ? labelDistance - 35
            : labelDistance) *
            Math.sin(midAngle - Math.PI / 2) -
          2;
        // Create a group for the text
        const textGroup = svg
          .append("g")
          .attr("transform", `translate(${labelX}, ${labelY})`)
          .attr("cursor", "pointer");
        // Add the icon
        textGroup
          .append("image")
          .attr("xlink:href", `/ods_${indicator}.png`)
          .attr("x", isMobile ? -10 : -12) // Center the icon: ;
          .attr("y", isMobile ? -4 : -6) // Reverted to original y position
          .attr("width", isMobile ? 20 : 24) // Set icon size: ;
          .attr("height", isMobile ? 20 : 24); // Set icon size

        const fontSize = isMobile ? "7px" : "8px";
        // Add first line
        textGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 28) // Reverted to original y position
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", fontSize)
          .style("color", "#212529")
          .style("text-transform", "uppercase")
          .style("letter-spacing", "0.96px")
          .text(firstLine);

        // Add second line
        textGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 40) // Reverted to original y position
          .style("color", "#212529")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", fontSize)
          .style("text-transform", "uppercase")
          .style("letter-spacing", "0.96px")
          .text(secondLine);
        if (thirdLine) {
          textGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 52) // Reverted to original y position
            .style("color", "#212529")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", fontSize)
            .style("text-transform", "uppercase")
            .style("letter-spacing", "0.96px")
            .text(thirdLine);
        }

        // Add event listeners for showing/hiding the tooltip
        textGroup
          .attr("tabindex", 0) // Make it focusable
          .on("mouseover", function (event) {
            setTootip({
              title: indicatorName,
              subtitle: indDescription,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("mousemove", function (event) {
            setTootip({
              title: indicatorName,
              subtitle: indDescription,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("mouseout", function () {
            setTootip(null);
          })
          .on("focus", function (event) {
            setTootip({
              title: indicatorName,
              subtitle: indDescription,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("blur", function () {
            // Hide tooltip on blur
            setTootip(null);
          });
      });
      setChartCreated(true);
    };

    updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);

    return () => {
      window.removeEventListener("resize", updateChartDimensions);
    };
  }, [data, indicators, lang, nationalData]);

  return (
    <>
      <div className="radar-chart-container h-full">
        {!chartCreated && (
          <Loader className="w-full h-full [&_span]:w-[48px] [&_span]:h-[48px]" />
        )}
        <svg ref={svgRef}></svg>
      </div>
      {tooltip && (
        <div
          className="tooltip w-fit inline-block z-20 absolute bg-white pointer-events-none"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            border: "1px solid #212529",
            padding: "16px",
            maxWidth: "300px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            opacity: 1,
            whiteSpace: "pre-wrap", // clave
            wordBreak: "break-word", // clave para palabras largas
          }}
        >
          <p className={`${tooltip.subtitle && "font-bold"}  `}>
            {tooltip.title}
          </p>
          {tooltip.subtitle && <p className="">{tooltip.subtitle}</p>}
          {(tooltip.valueGov || tooltip.valueNat) && (
            <>
              {(tooltip.valueGov || tooltip.valueGov !== "0") && (
                <div className="flex items-center gap-xs">
                  <div
                    className="w-4 h-4 rounded-[100%] bg-blue-CAF"
                    style={{ backgroundColor: countryColor }}
                  />
                  <p>{government.name}: {tooltip.valueGov}</p>
                </div>
              )}
              {(tooltip.valueNat || tooltip.valueNat === "0") && (
                <div className="flex items-center gap-xs">
                  <div
                    className="w-4 h-4 rounded-[100%]"
                    style={{ backgroundColor: govColor }}
                  />
                  <p>{getTextById(jurisdictionsCopy, "average", lang)} {country[`name_${lang}`]}: {tooltip.valueNat}</p>
                </div>
              )}
              {/* {(tooltip.valueP10 || tooltip.valueP90) && (
                <div className="flex items-center gap-xs">
                  <div
                    className="w-4 h-4 rounded-[100%]"
                    style={{ backgroundColor: percentileColor }}
                  />
                  <p>
                    {tooltip.valueP10} - {tooltip.valueP90}
                  </p>
                </div>
              )} */}
            </>
          )}
        </div>
      )}
      <div className="flex justify-end gap-s pt-m">
        <button
          style={{ marginRight: "25%" }}
          onClick={(event) => {
            setTootip({
              title: getTextById(jurisdictionsCopy, "tooltip_info", lang),
              x: event.pageX, // Adjust for scrolling
              y: event.pageY, // Adjust for scrolling
            });
            // }
          }}
          onMouseOver={(event) => {
            setTootip({
              title: getTextById(jurisdictionsCopy, "tooltip_info", lang,[{id:"year",replace:yearIndicators}]),
              x: event.pageX - 50, // Adjust for scrolling
              y: event.pageY, // Adjust for scrolling
            });
            // }
          }}
          onMouseOut={() => {
            setTootip(null);
          }}
          onBlur={() => {
            setTootip(null);
          }}
          onFocus={(event) => {
            setTootip({
              title: getTextById(jurisdictionsCopy, "tooltip_info", lang),
              x: event.pageX, // Adjust for scrolling
              y: event.pageY, // Adjust for scrolling
            });
            // }
          }}
        >
          <Info
            className={"w-4 h-4 fill-black hover:fill-blue-CAF cursor-pointer"}
          />
        </button>
      </div>
      <div className="flex flex-col gap-xxs items-center">
        <div className="flex justify-center gap-s py-m">
          <div className="flex gap-xs items-center">
            <div
              className="w-4 h-1 bg-blue-CAF"
              style={{ backgroundColor: countryColor }}
            />
            <p>
              {government.name}
            </p>
          </div>
          <div className="flex gap-xs items-center">
            <div className="w-4 h-1 " style={{ backgroundColor: govColor }} />
            <p>
              {getTextById(jurisdictionsCopy, "average", lang)}{" "}
              {country[`name_${lang}`]}
            </p>
          </div>
        </div>

        {/* <div className="flex gap-xs items-center">
          <div
            className="w-4 h-1 "
            style={{ backgroundColor: percentileColor }}
          />
          <p>Promedios para los percentiles 10 y 90</p>
        </div> */}
      </div>
    </>
  );
}

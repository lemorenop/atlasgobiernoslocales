import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useParams } from "next/navigation";
import { getTextById } from "@/app/utils/textUtils";

const govColor = "#1774AD";
const countryColor = "#55C7D5";

export default function RadarChart({ data, indicators, government,copy }) {
  console.log(government);
  const [tooltip, setTootip] = useState();
  const params = useParams();
  const lang = params.lang; // Obtenemos el idioma directamente de los parámetros de la URL
  const svgRef = useRef(null);
  const indicatorsID = [
    "21",
    "5",
    "7",
    "8",
    "13",
    "19",
    "10",
    "11",
    "12",
    "17",
    "20",
  ];
  const [nationalData, setNationalData] = useState(null);

  // Textos traducidos para la leyenda
  const legendTexts = {
    government: {
      es: "Gobierno",
      en: "Government",
      pt: "Governo",
    },
    nationalAverage: {
      es: "Promedio",
      en: "Average",
      pt: "Nacional",
    },
  };

  // Fetch national averages
  useEffect(() => {
    if (!government || !government.country_iso3) return;

    const fetchNationalAverages = async () => {
      try {
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
            value: 0,
          }))
        );
      }
    };

    fetchNationalAverages();
  }, [government]);

  useEffect(() => {
    const updateChartDimensions = () => {
      if (!svgRef.current) return;
      const container = svgRef.current.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const margin = { top: 60, right: 60, bottom: 60, left: 60 }; // Add some margin for better spacing
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const radius = Math.min(innerWidth, innerHeight) / 2;

      // Update SVG dimensions
      d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .select("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Redraw the chart with new dimensions
      drawChart(innerWidth, innerHeight, radius, margin, width, height);
    };

    const drawChart = (
      innerWidth,
      innerHeight,
      radius,
      margin,
      width,
      height
    ) => {
      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3
        .select(svgRef.current)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Create scales
      const angleScale = d3
        .scalePoint()
        .domain(indicatorsID)
        .range([0, 2 * Math.PI]);

      const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

      // Create background circles
      svg
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1);

      // Create data points for government values
      const governmentData = indicatorsID.map((id) => {
        const dataPoint = data.find((d) => d.indicator_code === id);
        // Los valores del gobierno también están entre 0 y 1, multiplicamos por 100
        const value = dataPoint ? parseFloat(dataPoint.value) * 100 : 0;

        return {
          indicator_code: id,
          value: isNaN(value) ? 0 : value, // Asegurarse de que sea un número válido
        };
      });

      // Process national average data
      const processedNationalData = indicatorsID.map((id) => {
        // Buscar usando el campo correcto del CSV (indicador_code)
        const natPoint = nationalData.find((d) => d.indicador_code === id);
        // Los valores están entre 0 y 1, multiplicamos por 100 para la escala del gráfico
        const value = natPoint ? parseFloat(natPoint.value) * 100 : 0;

        return {
          indicator_code: id,
          value: isNaN(value) ? 0 : value, // Asegurarse de que sea un número válido, usar 0 como fallback
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
        const displayGovValue = `${parseFloat(govData.value).toFixed(0)} ${indicatorInfo.unit_measure_id.unit}`;
        const displayNatValue = `${parseFloat(natData.value).toFixed(0)} ${indicatorInfo.unit_measure_id.unit}`;
        // Draw the segment background
        const arc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(radius)
          .startAngle(startAngle)
          .endAngle(endAngle);

        svg
          .append("path")
          .attr("d", arc)
          .attr("fill", "rgba(231, 246, 248, 0.50)")
          .attr("stroke", "rgba(85, 199, 213, 0.15)")
          .attr("stroke-width", 1);

        // Draw dividing lines (rayos de sol)
        const rayLength = radius + 10; // Extend 10 pixels beyond the circle

        // Start angle ray
        const startX = rayLength * Math.cos(startAngle - Math.PI / 2);
        const startY = rayLength * Math.sin(startAngle - Math.PI / 2);

        // svg
        //   .append("line")
        //   .attr("x1", 0)
        //   .attr("y1", 0)
        //   .attr("x2", startX)
        //   .attr("y2", startY)
        //   .attr("stroke", "#55C7D54D")
        //   .attr("stroke-width", 2)
          

        // End angle ray
        const endX = rayLength * Math.cos(endAngle - Math.PI / 2);
        const endY = rayLength * Math.sin(endAngle - Math.PI / 2);

        svg
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", "rgba(85, 199, 213, 0.30)")
          .attr("stroke-width", 1);

        // Calculamos ángulos separados para gobierno y promedio nacional
        const govAngleOffset = (endAngle - startAngle) * 0.25; // 25% desde el inicio
        const natAngleOffset = (endAngle - startAngle) * 0.75; // 75% desde el inicio

        // Ángulo para el valor del gobierno (1/4 del segmento)
        const govAngle = startAngle + govAngleOffset;
        const govX =
          radiusScale(govData.value) * Math.cos(govAngle - Math.PI / 2);
        const govY =
          radiusScale(govData.value) * Math.sin(govAngle - Math.PI / 2);
        const valuesTooltip= {title: indicatorName,
        valueNat: displayNatValue,
        valueGov: displayGovValue,}
        svg
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", govX)
          .attr("y2", govY)
          .attr("stroke", govColor)
          .attr("stroke-width", 2)
          .attr("cursor", "pointer")
          .attr("tabindex", 0)
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
          .on("focus", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("blur", function () {
            // Hide tooltip on blur
            setTootip(null);
          });

        // Ángulo para el promedio nacional (3/4 del segmento)
        const natAngle = startAngle + natAngleOffset;
        const natX =
          radiusScale(natData.value) * Math.cos(natAngle - Math.PI / 2);
        const natY =
          radiusScale(natData.value) * Math.sin(natAngle - Math.PI / 2);

        svg
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", natX)
          .attr("y2", natY)
          .attr("stroke", countryColor)
          .attr("stroke-width", 2)
          .attr("cursor", "pointer")
          .attr("tabindex", 0)
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
          .on("focus", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("blur", function () {
            // Hide tooltip on blur
            setTootip(null);
          });

        // Add data points
        svg
          .append("circle")
          .attr("cx", govX)
          .attr("cy", govY)
          .attr("r", 6)
          .attr("fill", govColor)
          .attr("tabindex", 0)
          .attr("cursor", "pointer")
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
          .on("focus", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("blur", function () {
            // Hide tooltip on blur
            setTootip(null);
          });

        svg
          .append("circle")
          .attr("cx", natX)
          .attr("cy", natY)
          .attr("r", 6)
          .attr("fill", countryColor)
          .attr("cursor", "pointer")
          .attr("tabindex", 0)
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
          .on("focus", function (event) {
            setTootip({
              ...valuesTooltip,
              x: event.pageX,
              y: event.pageY,
            });
          })
          .on("blur", function () {
            // Hide tooltip on blur
            setTootip(null);
          });

        // Split the indicator name into two lines
        const words = indicatorName.split(" ");
        const midPoint = Math.ceil(words.length / 2);
        const firstLine = words.slice(0, midPoint).join(" ");
        const secondLine = words.slice(midPoint).join(" ");

        // Add label for the indicator (two lines)
        const labelDistance = radius + 50; // Reduced distance to bring text closer
        const labelX =
          (midAngle < Math.PI / 2 || midAngle > (3 * Math.PI) / 2
            ? labelDistance + 20 // Move right in top-right and bottom-right
            : labelDistance) * Math.cos(midAngle - Math.PI / 2);
        const labelY =
          (midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2
            ? labelDistance - 35
            : labelDistance) * Math.sin(midAngle - Math.PI / 2)-2;
        // Create a group for the text
        const textGroup = svg
          .append("g")
          .attr("transform", `translate(${labelX}, ${labelY})`)
          .attr("cursor", "pointer");
        // Add the icon
        textGroup
          .append("image")
          .attr("xlink:href", `/ods_${indicator}.png`)
          .attr("x", -12) // Center the icon
          .attr("y", -6) // Reverted to original y position
          .attr("width", 24) // Set icon size
          .attr("height", 24); // Set icon size
        // Add first line
        textGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 28) // Reverted to original y position
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "8px")
          .style("color","#212529")
          .style("text-transform", "uppercase") 
          .style("letter-spacing", "0.96px")
          .text(firstLine);

        // Add second line
        textGroup
          .append("text")
          .attr("x", 0)
          .attr("y", 40) // Reverted to original y position
          .style("color","#212529")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "8px")
          .style("text-transform", "uppercase")
          .style("letter-spacing", "0.96px")
          .text(secondLine);

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
    };

    if (nationalData) updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);

    return () => {
      window.removeEventListener("resize", updateChartDimensions);
    };
  }, [data, indicators, lang, nationalData]);
  return (
    <>
      <div className="radar-chart-container h-full">
        <svg ref={svgRef}></svg>
      </div>
      {tooltip && (
        <div
          className="tooltip w-fit inline-block"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            position: "absolute",
            background: "#fff",
            border: "1px solid #212529",
            padding: "16px",
            maxWidth: "300px",            
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            pointerEvents: "none",
            opacity: 1,
            whiteSpace: "pre-wrap",          // clave
            wordBreak: "break-word",         // clave para palabras largas
          }}
        >
          <p className={`${tooltip.subtitle && "font-bold"}  `}>{tooltip.title}</p>
          {tooltip.subtitle && <p className="">{tooltip.subtitle}</p>}
          {(tooltip.valueGov || tooltip.valueNat) && (
            <>
              {(tooltip.valueGov || tooltip.valueGov !== "0") && (
                <div className="flex items-center gap-xs">
                  <div
                    className="w-4 h-4 rounded-[100%] bg-blue-CAF"
                    style={{ backgroundColor: countryColor }}
                  />
                  <p>{tooltip.valueGov}</p>
                </div>
              )}
              {(tooltip.valueNat || tooltip.valueNat === "0") && (
                <div className="flex items-center gap-xs">
                  <div
                    className="w-4 h-4 rounded-[100%]"
                    style={{ backgroundColor: govColor }}
                  />
                  <p>{tooltip.valueNat}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div className="flex justify-center gap-s pt-m">
        <div className="flex gap-xs items-center">
          <div
            className="w-4 h-1 bg-blue-CAF"
            style={{ backgroundColor: countryColor }}
          />
          <p>{government.name}</p>
        </div>
        <div className="flex gap-xs items-center">
          <div className="w-4 h-1 " style={{ backgroundColor: govColor }} />
          <p>{getTextById(copy,"average",lang)} {government.country[`name_${lang}`]}</p>
        </div>
      </div>
    </>
  );
}

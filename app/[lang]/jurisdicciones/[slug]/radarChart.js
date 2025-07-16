"use client";
import { useEffect, useRef, useState, useContext, useCallback } from "react";
import * as d3 from "d3";
import { getTextById } from "@/app/utils/textUtils";
import Info from "@/app/[lang]/components/icons/info";
import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import Loader from "@/app/[lang]/components/loader";
import { noDataColor } from "@/app/utils/mapSettings";
import Tooltip from "@/app/[lang]/components/tooltip";
import ReloadButton from "../../components/reloadButton";
const govColor = "#1774AD";
const countryColor = "#55C7D5";
const indicatorsID = [21, 5, 7, 8, 13, 19, 10, 11, 12, 17, 20];

export default function RadarChart({
  yearIndicators,
  compareGov,
  onDownloadFunctionReady,
}) {
  const { government, indicators, jurisdictionsCopy, jurisdictionData, lang } =
    useContext(JurisdictionDataContext);

  const data = jurisdictionData;
  const [tooltip, setTootip] = useState();
  const [nationalPosition, setNationalPosition] = useState(null);
  const [nationalData, setNationalData] = useState(null);
  const [chartCreated, setChartCreated] = useState(false);
  const [clientWidth, setClientWidth] = useState(0); // solo voy a volver a construit el svg si el ancho del contenedor cambia
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chartDimensions, setChartDimensions] = useState({
    innerWidth: 0,
    innerHeight: 0,
  });
  const svgRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Función para estructurar los datos del radar chart para CSV
  const getRadarChartDataForCSV = useCallback(() => {
    if (!data || !nationalData) {
      return null;
    }

    // Crear la fila de encabezados
    const headers = [
      lang === "es" ? "Jurisdicciones" : lang === "en" ? "Jurisdictions" : "Jurisdição",
    ];
    const indicatorNames = indicatorsID.map((id) => {
      const indicator = indicators.find((ind) => ind.code === id);
      return indicator ? indicator[`name_${lang}`] : `Indicator ${id}`;
    });
    headers.push(...indicatorNames);

    // Crear la fila de datos del gobierno
    const governmentRow = [government.name];
    indicatorsID.forEach((id) => {
      const dataPoint = data.find((d) => d.indicator_code === id);
      const value =
        dataPoint && dataPoint.value !== null
          ? `${(parseFloat(dataPoint.value) * 100).toFixed(2)}%`
          : getTextById(jurisdictionsCopy, "no_data", lang);
      governmentRow.push(value);
    });

    // Crear la fila de datos nacionales
    const nationalRow = [compareGov.name];
    indicatorsID.forEach((id) => {
      const dataPoint = nationalData.find((d) => d.indicator_code === id);
      const value =
        dataPoint && dataPoint.value !== null
          ? `${(parseFloat(dataPoint.value) * 100).toFixed(2)}%`
          : getTextById(jurisdictionsCopy, "no_data", lang);
      nationalRow.push(value);
    });

    return [headers, governmentRow, nationalRow];
  }, [data, nationalData, lang, compareGov]);

  // Notificar al padre cuando la función esté lista
  useEffect(() => {
    if (onDownloadFunctionReady && data && nationalData) {
      onDownloadFunctionReady(getRadarChartDataForCSV);
    }
  }, [data, nationalData, lang, compareGov, onDownloadFunctionReady]);
  const fetchNationalAverages = async () => {
    setIsLoading(true);
    if (compareGov.id === "national") {
      try {
        let nivel = government.level;
        // Construir la URL con los parámetros de filtro
        let url = `/api/national-averages?country_iso3=${government.country_iso3}`;
        if (nivel) {
          url += `&nivel=${nivel}`;
        }
        try {
          const data = await fetch(url).then((res) => res.json());

        
          if (!data.error) {
            if (data.length === 0) {
              setNationalData(
                indicatorsID.map((id) => ({
                  indicator_code: id,
                  value: null,
                }))
              );
            } else setNationalData(data);
          } else {
            setNationalData(null);
            setError(true);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error en /api/national-averages:", error);
          throw new Error(`❌ Error en /api/national-averages: ${error}`);
        }
      } catch (error) {
        console.error("Error en fetchNationalAverages:", error);
        setError(true);
        setIsLoading(false);
        setNationalData(null);
      }
    } else {    
      const jsonData = await fetch(
        `/api/gov-data?slug=${compareGov.id}&lang=${lang}`
      ).then((res) => res.json());

      if (!jsonData.error) {
        setNationalData(jsonData.data);
        setError(false);
        setIsLoading(false);
      } else {
        setError(true);
        setIsLoading(false);
      }
    }
  }
  // Fetch national averages
  useEffect(() => {
    if (compareGov) {
      fetchNationalAverages();
    }
  }, [compareGov]);
  const margin = { top: 100, right: 60, bottom: 60, left: 60 }; // Add some margin for better spacing
  useEffect(() => {
    // setDataDownload(getRadarChartDataForCSV)
    const updateChartDimensions = () => {
      if (!svgRef.current) {
        return;
      }
      const container = svgRef.current.parentElement;
      const width = container.clientWidth;
      setClientWidth(width);
      const height = container.clientHeight;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const minSize = Math.min(width, height);
      setChartDimensions({
        width: width,
        height: height,
        innerWidth: innerWidth,
        innerHeight: innerHeight,
      });
      // Update SVG dimensions
      d3.select(svgRef.current).attr("width", width).attr("height", height);
    };

    if (data && nationalData) updateChartDimensions();
    window.addEventListener("resize", updateChartDimensions);
    return () => {
      window.removeEventListener("resize", updateChartDimensions);
    };
  }, [data, nationalData]);

  useEffect(() => {
    const drawChart = (innerWidth, radius, innerRadius, width, height) => {
      // Clear previous chart
      d3.select(svgRef.current).selectAll("*").remove();
      const isMobile = innerWidth < 650;
      const svg = d3
        .select(svgRef.current)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

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
      // Calculate the angle for each indicator
      const angleStep = (2 * Math.PI) / indicatorsID.length;
      const natPositions = {};
      // Create data points for government values
      indicatorsID.forEach((ind, i) => {
        const dataPoint = data.find((d) => d.indicator_code === ind);
        const natPoint = nationalData.find((d) => d.indicator_code == ind);
        // Los valores están entre 0 y 1, multiplicamos por 100 para la escala del gráfico
        const valueGov = isNaN(parseFloat(dataPoint.value))
          ? null
          : parseFloat(dataPoint.value) * 100;
        const valueNat = isNaN(parseFloat(natPoint.value))
          ? null
          : parseFloat(natPoint.value) * 100;

        const startAngle = i * angleStep;
        const endAngle = (i + 1) * angleStep;
        const midAngle = startAngle + (endAngle - startAngle) / 2;

        // Find the indicator name from the indicators prop based on the current language
        const indicatorInfo = indicators
          ? indicators.find((indicator) => indicator.code === ind)
          : null;
        let indicatorName = indicatorInfo[`name_${lang}`];
        let indDescription = indicatorInfo[`description_${lang}`];

        const displayGovValue =
          valueGov != null
            ? `${parseFloat(valueGov).toFixed(0)} ${
                indicatorInfo.unit?.unit ? indicatorInfo.unit?.unit : ""
              }`
            : getTextById(jurisdictionsCopy, "no_data", lang);

        const displayNatValue =
          valueNat != null
            ? `${parseFloat(valueNat).toFixed(0)} ${
                indicatorInfo.unit?.unit ? indicatorInfo.unit?.unit : ""
              }`
            : getTextById(jurisdictionsCopy, "no_data", lang);

        const valuesTooltip = {
          title: indicatorName,
          valueNat: displayNatValue,
          valueGov: displayGovValue,
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
          radiusScale(valueGov || 0) * Math.cos(govAngle - Math.PI / 2);
        const govY =
          radiusScale(valueGov || 0) * Math.sin(govAngle - Math.PI / 2);

        // Ángulo para el promedio nacional (3/4 del segmento)
        const natAngle = startAngle + natAngleOffset;

        const maxValue = Math.max(valueNat || 0);

        const natX = radiusScale(maxValue) * Math.cos(natAngle - Math.PI / 2);
        const natY = radiusScale(maxValue) * Math.sin(natAngle - Math.PI / 2);
        natPositions[ind] = { angle: natAngle };

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
          .attr("x2", govStartX)
          .attr("y2", govStartY)
          .attr("stroke", countryColor)
          .attr("stroke-width", 2)
          .transition()
          .delay(300)
          .duration(1000)
          .attr("x2", govX)
          .attr("y2", govY);

        // Línea para el valor nacional (ahora extendida al máximo valor)
        svg
          .append("line")
          .attr("id", `line-${ind}-national`)
          .attr("x1", natStartX)
          .attr("y1", natStartY)
          .attr("x2", natStartX)
          .attr("y2", natStartY)
          .attr("stroke", govColor)
          .attr("stroke-width", 2)
          .transition()
          .delay(300)
          .duration(1000)
          .attr("x2", natX)
          .attr("y2", natY);

        // Punto para el valor del gobierno
        svg
          .append("circle")
          .attr("cx", govStartX)
          .attr("cy", govStartY)
          .attr("r", circleRadiusScale(valueGov || 0))
          .attr("fill", valueGov != null ? countryColor : noDataColor)
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
          })
          .transition()
          .delay(300)
          .duration(1000)
          .attr("cx", govX)
          .attr("cy", govY);
        svg
          .append("circle")
          .attr("id", `circle-${ind}-national`)
          .attr("cx", natStartX)
          .attr("cy", natStartY)
          .attr("r", circleRadiusScale(valueNat || 0))
          .attr("fill", valueNat != null ? govColor : noDataColor)
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
          })
          .transition()
          .delay(300)
          .duration(1000)
          .attr("cx", natX)
          .attr("cy", natY);

        // Split the indicator name into two lines
        const words = indicatorName.split(" ");
        const midPoint = ind === 8 ? 1 : Math.ceil(words.length / 2);
        const firstLine = words.slice(0, midPoint).join(" ");
        const longIndicators = [7, 8, 11, 19]; // indicadores con nombres largos
        const secondLine = longIndicators.includes(ind)
          ? words.slice(midPoint, midPoint + 1).join(" ")
          : words.slice(midPoint).join(" ");
        const thirdLine = longIndicators.includes(ind)
          ? words.slice(midPoint + 1).join(" ")
          : null;
        // Add label for the ind (two lines)
        const labelDistance = radius + (isMobile ? 47 : 50); // Reduced distance to bring text closer
        const labelX =
          isMobile && ind === 8
            ? labelDistance - 30
            : isMobile && ind === 7
            ? labelDistance - 16
            : isMobile && ind === 12
            ? -labelDistance + 18
            : isMobile && ind === 11
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
          .attr("xlink:href", `/ods_${ind}.png`)
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

      setNationalPosition(natPositions);
      setIsLoading(false);
      setChartCreated(true);
    };
    // Redraw the chart with new dimensions
    if (data && nationalData) {
      const { innerWidth, innerHeight, width, height } = chartDimensions;
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const innerRadius = radius * 0.15; // 30% of the outer radius for the inner circle
      drawChart(innerWidth, radius, innerRadius, width, height);
    }
  }, [clientWidth, data]);

  useEffect(() => {
    if (chartCreated) drawSegments();
    function drawSegments() {
      const { innerWidth, innerHeight, width, height } = chartDimensions;
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const innerRadius = radius * 0.15; // 30% of the outer radius for the inner circle
      indicatorsID.map((indicator, i) => {
        const svg = d3.select(svgRef.current);
        const line = svg.select(`#line-${indicator}-national`);
        const value =
          nationalData.find((d) => d.indicator_code == indicator).value * 100 ||
          0;

        const radiusScale = d3
          .scaleLinear()
          .domain([0, 100])
          .range([innerRadius, radius]);

        const circle = svg.select(`#circle-${indicator}-national`);

        [line, circle].map((el, i) =>
          el
            .transition()
            .delay(300)
            .duration(1000)
            .attr(
              i === 0 ? "x2" : "cx",
              radiusScale(value) *
                Math.cos(nationalPosition[indicator].angle - Math.PI / 2)
            )
            .attr(
              i === 0 ? "y2" : "cy",
              radiusScale(value) *
                Math.sin(nationalPosition[indicator].angle - Math.PI / 2)
            )
        );
      });
    }
  }, [nationalData, chartCreated]);
  useEffect(() => {
    const handleScroll = () => {
      setTootip(null);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
 
  return (
    <div className="flex flex-col lg:col-span-8 min-h-[400px] md:min-h-[600px] max-h-screen">
      <div className="radar-chart-container h-full relative grow">
        { isLoading && (
          <div className="absolute top-0 left-0 w-full h-full opacity-50 z-10 bg-white">
            <Loader className="w-full h-full [&_span]:w-[48px] [&_span]:h-[48px]" />
          </div>
        )}
        {/* {!chartCreated && isLoading && (
          <Loader className="w-full h-full [&_span]:w-[48px] [&_span]:h-[48px]" />
        )} */}
        {error && !isLoading && (
          <ReloadButton
            copy={jurisdictionsCopy}
            lang={lang}
            onClick={fetchNationalAverages}
          />
        )}
        <svg className="mx-auto" ref={svgRef}></svg>
      </div>
      {tooltip && (
        <Tooltip tooltip={tooltip}>
          <>
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
                    <p>
                      {government.name}: {tooltip.valueGov}
                    </p>
                  </div>
                )}
                {(tooltip.valueNat || tooltip.valueNat === "0") && (
                  <div className="flex items-center gap-xs">
                    <div
                      className="w-4 h-4 rounded-[100%]"
                      style={{ backgroundColor: govColor }}
                    />
                    <p>
                      {compareGov.name}: {tooltip.valueNat}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        </Tooltip>
      )}
      <div className="flex justify-end gap-s pt-m">
        <button
          style={{ marginRight: "25%" }}
          onClick={(event) => {
            setTootip({
              title: getTextById(jurisdictionsCopy, "tooltip_info", lang, [
                { id: "year", replace: yearIndicators },
              ]),
              x: event.pageX, // Adjust for scrolling
              y: event.pageY, // Adjust for scrolling
            });
            // }
          }}
          onMouseOver={(event) => {
            setTootip({
              title: getTextById(jurisdictionsCopy, "tooltip_info", lang, [
                { id: "year", replace: yearIndicators },
              ]),
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
              title: getTextById(jurisdictionsCopy, "tooltip_info", lang, [
                { id: "year", replace: yearIndicators },
              ]),
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
            <p>{government.name}</p>
          </div>
          <div className="flex gap-xs items-center">
            <div className="w-4 h-1 " style={{ backgroundColor: govColor }} />
            <p>{compareGov.name}</p>
          </div>{" "}
        </div>
      </div>
    </div>
  );
}

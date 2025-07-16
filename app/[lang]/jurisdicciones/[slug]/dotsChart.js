"use client";
import Select from "@/app/[lang]/components/select";
import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import { useContext, useState, useEffect, useRef } from "react";
import {
  getTextById,
  formatValue,
  formatAxisLabel,
} from "@/app/utils/textUtils";
import * as d3 from "d3";
import Loader from "@/app/[lang]/components/loader";
import Share from "@/app/[lang]/components/share";
import Info from "@/app/[lang]/components/icons/info";
import Tooltip from "@/app/[lang]/components/tooltip";
import Download from "@/app/[lang]/components/download";
import ReloadButton from "@/app/[lang]/components/reloadButton";
import { chartStyles } from "@/app/utils/chartStyles";

export default function DotsChart() {
  const {
    indicators,
    jurisdictionsCopy,
    lang,
    government,
    country,
    tooltipInfo,
  } = useContext(JurisdictionDataContext);
  const [tooltip, setTooltip] = useState(null);
  const [selectedIndicator, setSelectedIndicator] = useState(indicators[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [values, setValues] = useState();
  const svgRef = useRef(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [logValues, setLogValues] = useState(null);
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamic import of governments file based on language
      const governmentsModule = await import(
        `@/app/utils/governments/governments_${lang}.json`
      ).then((res) =>
        res.default.filter(
          (r) =>
            r.countryCode === government.country_iso3 &&
            r.nivel === government.level
        )
      );

      const url = `/api/govs-by-country?countryCode=${government.country_iso3}&level=${government.level}&lang=${lang}`;

     
      const response = await fetch(url).then((res) => res.json());
      if (response.data) {
        const govsByCountry = response.data;

        setData({
          governments: governmentsModule,
          governmentsData: govsByCountry,
        });
      } else {
        setIsLoading(false);
        setError(true);
      }
    } catch (error) {
      console.error(`Error en dataProvider:`, error);
      setError(true);
      setIsLoading(false);
    }
  };
  const [downloadFnCsv, setDownloadFnCsv] = useState(null);
  const loadLogValues = async () => {
    if ([1, 2, 3].includes(selectedIndicator.code)) {
      try {
        const response = await fetch(`/api/log-values`).then((res) =>
          res.json()
        );
        const filteredLogValues = response.data.filter(
          (elm) => elm.indicator_code === selectedIndicator.code
        );
        setLogValues(filteredLogValues);
      } catch (error) {
        console.error("Error loading log values:", error);
        setLogValues(null);
      }
    } else {
      setLogValues(null);
    }
  };

  useEffect(() => {
    loadData();
  }, [lang, government]);

  useEffect(() => {
    loadLogValues();
  }, [selectedIndicator]);
  useEffect(() => {
    if (data) {
      setIsLoading(true);
      if (data && selectedIndicator && data.governmentsData) {
        const currentData = data.governmentsData.filter(
          (elm) =>
            elm.indicator_code === selectedIndicator.code && elm.value !== null
        );

        // Función para crear datos CSV
        const createCsvData = () => {
          if (!currentData.length || !data.governments) return [];

          return currentData.map((item) => {
            const jurisdiction = data.governments.find(
              (g) => g.id === item.government_id
            );
            const obj = {
              id: item.government_id,
            };
            obj[
              lang === "es"
                ? "Jurisdicciones"
                : lang === "en"
                ? "Jurisdictions"
                : "Jurisdiçoes"
            ] = jurisdiction.name;
            obj[lang==='es'?'Nivel de gobierno':lang==='pt'?"Nível de governo":'level of government'] = jurisdiction.completeName; 
            obj[`${selectedIndicator[`name_${lang}`]}`] =  item.value;
            return obj;
          });
        };

        setDownloadFnCsv(() => createCsvData);
        d3.select(svgRef.current).selectAll("*").remove();
        if (!currentData.length || !svgRef.current || !selectedIndicator) {
          setIsLoading(false);
          setValues(null);
          return;
        }

        // Clear previous chart

        if (currentData.length > 0) {
          const container = svgRef.current.parentElement;
          const containerStyle = window.getComputedStyle(container);
          const paddingLeft = parseFloat(containerStyle.paddingLeft);
          const paddingRight = parseFloat(containerStyle.paddingRight);
          const containerWidth =
            container.clientWidth - paddingLeft - paddingRight;
          const containerHeight = 400; // Altura fija para mantener proporción
          const isMobile = container.clientWidth < 600;
          const margin = {
            top: 40,
            right: isMobile ? 10 : 20,
            bottom: 60,
            left: isMobile ? 10 : 60,
          };
          const width = containerWidth - margin.left - margin.right;
          const height = containerHeight - margin.top - margin.bottom;

          const svg = d3
            .select(svgRef.current)
            .attr("width", containerWidth)
            .attr("height", containerHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

          // Convert values to percentages if needed
          const isPercentage = selectedIndicator.unit_measure_id === "perc";
          const processedData = currentData.map((d) => ({
            ...d,
            value: isPercentage ? d.value * 100 : d.value,
          }));
          const maxValue = Math.max(...processedData.map((d) => d.value));
          const minValue = Math.min(...processedData.map((d) => d.value));
          const value = processedData.find(
            (d) => d.government_id === government.id
          )?.value;
          setValues({ maxValue, minValue, value });

          // Create scales
          let xScale;
          let useCustomLog =
            [1, 2, 3].includes(selectedIndicator.code) &&
            logValues &&
            logValues.length > 0;
          let filteredLogValues = logValues;
          let minLogValue, maxLogValue; // <-- Declarar aquí

          if (useCustomLog) {
            // --- ORIGINAL: escala por cortes (getCustomLogScale) ---
            // filteredLogValues = logValues.filter(
            //   (b) => b.level == government.level
            // );
            // xScale = getCustomLogScale(filteredLogValues, width);
            // --- FIN ORIGINAL ---

            // --- OPCIONAL: escala logarítmica estándar ---
            // Para probar la escala logarítmica, descomentar este bloque y comentar el original de arriba
            const logData = processedData.filter(d => d.value > 0);
            minLogValue = d3.min(logData, d => d.value); // <-- Asignar aquí
            maxLogValue = d3.max(logData, d => d.value); // <-- Asignar aquí
            xScale = d3.scaleLog()
              .domain([minLogValue, maxLogValue])
              .range([0, width]);
            // --- FIN OPCIONAL ---
          } else {
            xScale = d3
              .scaleLinear()
              .domain([minValue, maxValue])
              .range([0, width]);
          }

          // --- NUEVO: Jitter aleatorio dependiente de densidad ---
          // 1. Calcular bins (histograma) sobre el eje X
          const numBins = Math.max(10, Math.floor(Math.sqrt(processedData.length)));
          const xValues = processedData.map(d => useCustomLog ? xScale(d.value) : xScale(d.value));
          const bins = d3.bin()
            .domain([0, width])
            .thresholds(numBins)(xValues);

          // 2. Para cada bin, calcular la cantidad de puntos (densidad)
          //    y asignar un jitter máximo proporcional a la densidad
          const maxJitter = height * 0.8; // altura máxima de la nube
          const minJitter = 30; // altura mínima para zonas poco densas
          const maxBinLength = d3.max(bins, b => b.length) || 1;

          // 3. Para cada punto, asignar jitter aleatorio según densidad local
          const points = processedData.map((item, idx) => {
            const x = useCustomLog ? xScale(item.value) : xScale(item.value);
            // Buscar el bin correspondiente
            const binIdx = bins.findIndex(b => x >= b.x0 && x < b.x1);
            const bin = bins[binIdx] || bins[0];
            const density = bin.length / maxBinLength; // 0..1
            const jitterRange = minJitter + density * (maxJitter - minJitter);
            // Jitter aleatorio centrado en height/2
            const y = height / 2 + (Math.random() - 0.5) * jitterRange;
            return {
              ...item,
              x,
              y,
            };
          });

          // Format number for axis labels
          const formatNumber = (d) => {
            if (isPercentage) return d + "%";
            if (d >= 1000000) {
              const value = d / 1000000;
              return Number.isInteger(value)
                ? value + "M"
                : value.toFixed(1) + "M";
            }
            if (d >= 1000) {
              const value = d / 1000;
              return Number.isInteger(value)
                ? value + "K"
                : value.toFixed(1) + "K";
            }
            return Number.isInteger(d) ? d : d.toFixed(1);
          };

          // Add X axis
          if (useCustomLog) {
            // --- ORIGINAL: eje X por cortes ---
            const bins = [...filteredLogValues].sort((a, b) => a.bin - b.bin);
            // const segmentWidth = width / bins.length;
            // Mostrar mínimo a la izquierda
            // svg
            //   .append("text")
            //   .attr("x", 0)
            //   .attr("y", height + 20)
            //   .attr("text-anchor", "end")
            //   .style("font-family", chartStyles.fontFamily)
            //   .style("font-size", "12px")
            //   .style("color", chartStyles.textColor)
            //   .text(
            //     formatAxisLabel(bins[0].min, selectedIndicator.unit_measure_id)
            //   );
            // Mostrar valores intermedios
            // bins.slice(1, -1).forEach((bin, i) => {
            //   const xPos = (i + 1) * segmentWidth;
            //   svg
            //     .append("text")
            //     .attr("x", xPos)
            //     .attr("y", height + 20)
            //     .attr("text-anchor", "start")
            //     .style("font-family", chartStyles.fontFamily)
            //     .style("font-size", "12px")
            //     .style("color", chartStyles.textColor)
            //     .text(
            //       formatAxisLabel(bin.min, selectedIndicator.unit_measure_id)
            //     );
            // });
            // Mostrar máximo con "+" donde empieza el último gap
            // const maxValue =
            //   bins[bins.length - 1].max || bins[bins.length - 1].min;
            // const lastBinStartX = (bins.length - 1) * segmentWidth;
            // svg
            //   .append("text")
            //   .attr("x", lastBinStartX)
            //   .attr("y", height + 20)
            //   .attr("text-anchor", "start")
            //   .style("font-family", chartStyles.fontFamily)
            //   .style("font-size", "12px")
            //   .style("color", chartStyles.textColor)
            //   .text(
            //     formatAxisLabel(maxValue, selectedIndicator.unit_measure_id) +
            //       "+"
            //   );
            // --- FIN ORIGINAL ---

            // --- OPCIONAL: eje X logarítmico estándar ---
            // Para probar el eje logarítmico, descomentar este bloque y comentar el original de arriba
            // Calcular los ticks como potencias de 10 dentro del dominio
            // (esto reemplaza el uso de xScale.ticks() que puede dar valores no deseados)
            const logMin = Math.ceil(Math.log10(minLogValue));
            const logMax = Math.floor(Math.log10(maxLogValue));
            const tickValues = [];
            for (let exp = logMin; exp <= logMax; exp++) {
              tickValues.push(Math.pow(10, exp));
            }
            svg
              .append("g")
              .attr("transform", `translate(0,${height})`)
              .call(
                d3.axisBottom(xScale)
                  .tickValues(tickValues)
                  .tickFormat(d3.format(".0s"))
              )
              .selectAll("text")
              .style("text-anchor", "end")
              .style("font-size", "12px")
              .style("color", chartStyles.textColor)
              .style("font-family", "Raleway");
            svg.selectAll(".domain, .tick line").remove();
            // --- FIN OPCIONAL ---
          } else {
            svg
              .append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(xScale).tickFormat(formatNumber))
              .selectAll("text")
              .style("text-anchor", "end")
              .style("font-size", "12px")
              .style("color", chartStyles.textColor)
              .style("font-family", "Raleway");
            // Remove the line and ticks from X axis
            svg.selectAll(".domain, .tick line").remove();
          }

          // Add Y axis with no labels and no line
          svg
            .append("g")
            .call(
              d3.axisLeft(d3.scaleLinear().range([height, 0])).tickFormat("")
            )
            .selectAll(".domain, .tick line")
            .remove();

          // Add dots (beeswarm/jitter)
          let govPoint={}
          points.forEach((point) => {
          if(point.government_id=== government.id) return govPoint=point
            const jurisdiction = data.governments.find(
              (g) => g.id === point.government_id
            );
            if (jurisdiction) {
              const jurisdictionName = jurisdiction.name;
              const value = formatValue(
                point.value,
                selectedIndicator.unit_measure_id,
                lang,
                true
              );
              const tooltipContent = {
                title: jurisdictionName,
                valueGov: value,
              };
              svg
                .append("circle")
                .attr("cx", point.x)
                .attr("cy", point.y)
                .attr("r", chartStyles.dotSize)
                .attr("fill", "#55C7D5")
                .attr("stroke", "#004A80")
                .attr(
                  "stroke-width",
                  point.government_id === government.id ? 2 : 0.5
                )
                .attr("cursor", "pointer")
                .on("mouseover", function (event) {
                  d3.select(this).attr("r", 6);
                  setTooltip({
                    ...tooltipContent,
                    government_id: point.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("click", function (event) {
                  d3.select(this).attr("r", 6);
                  setTooltip({
                    ...tooltipContent,
                    government_id: point.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("mousemove", function (event) {
                  d3.select(this).attr("r", 6);
                  setTooltip({
                    ...tooltipContent,
                    government_id: point.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("mouseout", function () {
                  d3.select(this).attr("r", chartStyles.dotSize);
                  setTooltip(null);
                })
                .attr("tabindex", 0)
                .on("focus", function (event) {
                  d3.select(this).attr("r", 6);
                  setTooltip({
                    ...tooltipContent,
                    government_id: point.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("blur", function () {
                  d3.select(this).attr("r", chartStyles.dotSize);
                  setTooltip(null);
                });
            }
          });
          const jurisdictionName = government.name;
          const govValue = formatValue(
            govPoint.value,
            selectedIndicator.unit_measure_id,
            lang,
            true
          );
          const tooltipContent = {
            title: jurisdictionName,
            valueGov: govValue,
          };
          svg
                .append("circle")
                .attr("cx", govPoint.x)
                .attr("cy", govPoint.y)
                .attr("r", chartStyles.dotSize*3)
                .attr("fill", "#55C7D5")
                .attr("stroke", "#004A80")
                .attr(
                  "stroke-width",2
                )
                .attr("cursor", "pointer")
                .on("mouseover", function (event) {
                  d3.select(this).attr("r", chartStyles.dotSize*4);
                  setTooltip({
                    ...tooltipContent,
                    government_id: govPoint.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("click", function (event) {
                  d3.select(this).attr("r",chartStyles.dotSize*4);
                  setTooltip({
                    ...tooltipContent,
                    government_id: govPoint.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("mousemove", function (event) {
                  d3.select(this).attr("r", chartStyles.dotSize*4);
                  setTooltip({
                    ...tooltipContent,
                    government_id: govPoint.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("mouseout", function () {
                  d3.select(this).attr("r", chartStyles.dotSize*3);
                  setTooltip(null);
                })
                .attr("tabindex", 0)
                .on("focus", function (event) {
                  d3.select(this).attr("r", chartStyles.dotSize*4);
                  setTooltip({
                    ...tooltipContent,
                    government_id: govPoint.government_id,
                    x: event.pageX,
                    y: event.pageY,
                  });
                })
                .on("blur", function () {
                  d3.select(this).attr("r", chartStyles.dotSize*3);
                  setTooltip(null);
                });
          // Add X axis label
          svg
            .append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .style("color", chartStyles.textColor)
            .style("font-family", "Raleway")
            .text(selectedIndicator.name);
        }
        setIsLoading(false);
      } else if (data && !data.governmentsData) {
        setValues(null);
        setIsLoading(false);
      }
    }
  }, [selectedIndicator, data, svgRef, logValues]);

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      // Clear the previous timeout
      clearTimeout(timeoutId);
      // Set a new timeout
      timeoutId = setTimeout(() => {
        if (svgRef.current) {
          // Force a re-render by updating the selected indicator
          setSelectedIndicator((prev) => ({ ...prev }));
        }
      }, 250); // Wait 250ms after the last resize event
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  const title = getTextById(jurisdictionsCopy, "dots_chart_title", lang, [
    { id: "jurisdiction_name", replace: government.name },
  ]);
  const subtitle = values
    ? getTextById(jurisdictionsCopy, "dots_chart_subtitle", lang, [
        { id: "jurisdiction_name", replace: government.name },
        { id: "level_name", replace: government["description_" + lang] },
        { id: "indicator_name", replace: selectedIndicator[`name_${lang}`] },
        {
          id: "value",
          replace: formatValue(
            values.value,
            selectedIndicator.unit_measure_id,
            lang
          ),
        },
        {
          id: "max_value",
          replace: formatValue(
            values.maxValue,
            selectedIndicator.unit_measure_id,
            lang
          ),
        },
        {
          id: "min_value",
          replace: formatValue(
            values.minValue,
            selectedIndicator.unit_measure_id,
            lang
          ),
        },
        { id: "country_name", replace: country[`name_${lang}`] },
      ])
    : "";
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
    <div className="flex flex-col gap-[24px] " id="dots-chart">
      <div className="flex flex-col gap-[24px] md:max-w-[80%] mx-auto">
        <h2 className="text-navy text-h2 text-center font-bold [&_span]:text-cyan">
          {title}
        </h2>
        <p className="text-black  text-center [&_span]:text-cyan [&_span]:font-bold">
          {getTextById(jurisdictionsCopy, "dots_chart_intro", lang, [
            { id: "level_name", replace: government.level_name },
            { id: "country_name", replace: country[`name_${lang}`] },
            { id: "jurisdiction_name", replace: government.name },
            {
              id: "indicator_name",
              replace: selectedIndicator[`name_${lang}`],
            },
          ])}
        </p>
        <p className="text-black  text-center [&_span]:text-cyan [&_span]:font-bold">
          {subtitle}
        </p>
      </div>

      <div className="flex gap-m flex-col pt-[32px]">
        <div className="flex justify-between gap-2xl items-end">
          <div className="flex flex-col gap-xs exclude-from-capture max-sm:w-full ">
            <p>{getTextById(jurisdictionsCopy, "select_indicator", lang)}</p>
            <Select
              id="code"
              selected={selectedIndicator}
              lang={lang}
              options={[{ options: indicators }]}
              onChange={setSelectedIndicator}
            />
          </div>
          <div className="flex justify-end gap-s pt-m">
            <button
              onClick={(event) => {
                setTooltip({
                  title: tooltipInfo,
                  x: event.pageX, // Adjust for scrolling
                  y: event.pageY, // Adjust for scrolling
                });
                // }
              }}
              onMouseOver={(event) => {
                setTooltip({
                  title: tooltipInfo,
                  x: event.pageX - 50, // Adjust for scrolling
                  y: event.pageY, // Adjust for scrolling
                });
                // }
              }}
              onMouseOut={() => {
                setTooltip(null);
              }}
              onBlur={() => {
                setTooltip(null);
              }}
              onFocus={(event) => {
                setTooltip({
                  title: tooltipInfo,
                  x: event.pageX, // Adjust for scrolling
                  y: event.pageY, // Adjust for scrolling
                });
                // }
              }}
            >
              <Info
                className={
                  "w-4 h-4 fill-black hover:fill-blue-CAF cursor-pointer"
                }
              />
            </button>
          </div>{" "}
        </div>
        <div className="overflow-x-auto bg-[#55C7D51A] border-1 border-[#55C7D54D] p-m relative">
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader className="w-10 h-10  min-w-10 min-h-10 [&_span]:w-full [&_span]:h-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <ReloadButton
                copy={jurisdictionsCopy}
                lang={lang}
                onClick={loadData}
              />
            </div>
          ) : !values ? (
            <p
              style={{ top: "40%" }}
              className="text-center text-black right-0 left-0 absolute h-fit m-auto"
            >
              {getTextById(jurisdictionsCopy, "no_data", lang)}
            </p>
          ) : (
            <></>
          )}

          <svg ref={svgRef}></svg>
        </div>
      </div>

      {tooltip && (
        <Tooltip tooltip={tooltip}>
          <>
            <p className={`${tooltip.subtitle && "font-bold"}  `}>
              {tooltip.title}
            </p>
            {tooltip.valueGov && (
              <div className="flex items-center gap-xs">
                <div
                  style={{
                    borderColor:
                      tooltip.government_id === government.id
                        ? "#004A80"
                        : "#55C7D5",
                    backgroundColor: "#55C7D5",
                  }}
                  className={`w-4 h-4 rounded-[100%]   ${
                    tooltip.government_id === government.id
                      ? "border-2 "
                      : "border-2 "
                  }`}
                />
                <p>{tooltip.valueGov}</p>
              </div>
            )}
          </>
        </Tooltip>
      )}
      <div className="exclude-from-capture flex justify-between max-md:flex-col gap-[24px]">
        <div className="sm:max-w-80 max-sm:w-full caption">
          {" "}
          <Share
            color="#004A80"
            shareText={government["description_" + lang]}
            shareTitle={getTextById(jurisdictionsCopy, "share", lang)}
          />
        </div>
        <div className="max-sm:w-full md:w-80">
          <Download
            chartDataFunction={downloadFnCsv}
            disabled={isLoading || error ? true : false}
            downloadName={`${country[`name_${lang}`]}-${
              selectedIndicator[`name_${lang}`]
            }`}
            lang={lang}
            copy={jurisdictionsCopy}
            refImage={"dots-chart"}
            buttonId="dots-chart"
          />
        </div>
      </div>
    </div>
  );
}

// Función para mapear valores a la escala logarítmica personalizada
function getCustomLogScale(bins, width) {
  if (!bins || bins.length === 0) return null;
  // Calcular los límites de cada bin
  const binEdges = bins.map((b, i) => ({
    min: b.min,
    max: b.max !== undefined ? b.max : null,
    bin: b.bin,
  }));
  // El último bin puede no tener max, usar el máximo valor real
  const lastMax = binEdges[binEdges.length - 1].max;
  // Dividir el eje X en segmentos iguales por bin
  const segmentWidth = width / bins.length;

  // Función que mapea un valor a la posición X
  return function (value) {
    // Encontrar el bin correspondiente
    let binIdx = binEdges.findIndex((b, i) => {
      if (b.max === null) return value >= b.min;
      return value >= b.min && value < b.max;
    });
    if (binIdx === -1) binIdx = binEdges.length - 1; // Si no encuentra, usar el último
    const bin = binEdges[binIdx];
    // Calcular la posición relativa dentro del bin
    let rel = 0;
    if (bin.max !== null && bin.max !== bin.min) {
      rel = (value - bin.min) / (bin.max - bin.min);
    }
    // Si es el último bin (sin max), poner todos juntos al final
    if (bin.max === null) rel = 0.5;
    // Posición final
    return binIdx * segmentWidth + rel * segmentWidth;
  };
}

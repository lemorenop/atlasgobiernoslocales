"use client";
import {
  handleMapLoad,
  lineColor,
  noDataColor,
  basicSettings,
  latinAmericaView,
  latinAmericaBounds,
  southAmericaBounds,
  caribbeanBounds,
  centralAmericaBounds,
} from "@/app/utils/mapSettings";
import { useState, useEffect, useMemo, useRef } from "react";
import { Map, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import * as d3 from "d3";
import { getTextById } from "@/app/utils/textUtils";

export default function MapIndicator({
  selectedNivel,
  governments,
  lang,
  selectedCountryIso3,
  countryCoordinates,
  copy,
  indicator,
  countries,maxPerLevel
}) {
  let govs=[]
Object.keys(governments).forEach(key => {
 if(governments[key].countryName==="Guatemala") govs.push(governments[key]);
});
console.log(govs)
  const localType =
    selectedCountryIso3 === "PER" ||
    selectedCountryIso3 === "SLV" ||
    selectedCountryIso3 === "DOM" ||
    selectedCountryIso3 === "HTI"
      ? selectedCountryIso3
      : Number.isInteger(selectedCountryIso3)
      ? "region"
      : selectedCountryIso3 === "all"
      ? "all"
      : "default";

  // Get countries that belong to the selected region
  const getCountriesInRegion = useMemo(() => {
    if (!Number.isInteger(selectedCountryIso3) || !countries) {
      return [];
    } else {
      return countries
        .filter((country) => country.region_id == selectedCountryIso3)
        .map((country) => country.iso3);
    }
  }, [selectedCountryIso3, countries]);

  const mapRef = useRef();
  const isPercentage = indicator.unit_measure_id === "perc";
  // Efecto para manejar el zoom al país seleccionado
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    // Si el país seleccionado es 'all', volver a la vista por defecto
    if (selectedCountryIso3 === "all") {
      map.fitBounds(latinAmericaBounds, {
        padding: 50,
        duration: 1000,
      });
      return;
    } else if (localType === "region") {
      switch (selectedCountryIso3) {
        case 1:
          map.fitBounds(southAmericaBounds, {
            padding: 50,
            duration: 1000,
          });
          break;
        case 2:
          map.fitBounds(caribbeanBounds, {
            padding: 50,
            duration: 1000,
          });
          break;
        case 3:
          map.fitBounds(centralAmericaBounds, {
            padding: 50,
            duration: 1000,
          });
      }
    }
    // Si no hay coordenadas del país, no hacer nada
    if (!countryCoordinates || countryCoordinates.error) return;
    map.fitBounds(countryCoordinates, {
      padding: 50,
      duration: 1000,
    });
  }, [selectedCountryIso3, countryCoordinates, localType]);
  // Crear escala de colores usando d3
  const colorScale = useMemo(() => {

    // For percentage indicators with min/max defined
    if (
      isPercentage &&
      indicator.min !== undefined &&
      indicator.max !== undefined
    ) {
      const percentageScale = d3
        .scaleSequential()
        .domain([indicator.min / 100, indicator.max / 100])
        .interpolator(d3.interpolateBlues);

      return {
        scale: percentageScale,
        isLogarithmic: false,
      };
    }

 

    // For non-percentage indicators, use logarithmic scale
    const minValue = 0; // Force minimum to be 0
    console.log("maxPerLevel",maxPerLevel)
    const maxValue = maxPerLevel[`nivel${selectedNivel.value}`];

    // Create logarithmic scale
    const logScale = d3
      .scaleSequential()
      .domain([Math.log(Math.max(1, minValue)), Math.log(maxValue)]) // Use max(1, minValue) to avoid log(0)
      .interpolator(d3.interpolateBlues);

    // Create ticks for the legend (5 values)
    const logTicks = d3.range(5).map((i) => {
      if (i === 0) return 0; // First tick is always 0
      const t = i / 4;
      const value = Math.exp(
        logScale.domain()[0] * (1 - t) + logScale.domain()[1] * t
      );
      // Round to nearest multiple of 10
      const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
      return Math.round(value / magnitude) * magnitude;
    });

    return {
      scale: logScale,
      ticks: logTicks,
      isLogarithmic: true,
    };
  }, [
    selectedNivel.value,
    indicator.min,
    indicator.max,
    isPercentage,
    maxPerLevel
  ]);

  // Función para obtener el color basado en el valor
  const getColorForValue = useMemo(() => {
    if (!colorScale) return () => noDataColor;
    return (value) => {
      if (value === undefined || value === null) return noDataColor;

      // For percentage indicators
      if (
        isPercentage &&
        indicator.min !== undefined &&
        indicator.max !== undefined
      ) {
        const truncatedValue = Math.min(
          Math.max(value, indicator.min / 100),
          indicator.max / 100
        );
        return colorScale.scale(truncatedValue);
      }

      // For non-percentage indicators, use logarithmic scale
      if (!isPercentage && colorScale.isLogarithmic) {
        return colorScale.scale(Math.log(value));
      }

      return colorScale.scale(value);
    };
  }, [colorScale, isPercentage, indicator.min, indicator.max]);

  function handleLoad() {
    const map = mapRef.current?.getMap();

    map.fitBounds(latinAmericaBounds, {
      padding: 50,
      duration: 1000,
    });
    return handleMapLoad(map, lang);
  }



  // Layer styles for each level using tilesets
  const nivel1Layer = {
    id: "nivel1-layer",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["has", "codigo_uni"],
        [
          "match",
          ["get", "codigo_uni"],
          ...Object.entries(governments || {}).flatMap(([key, value]) => [
            key,
            getColorForValue(value.value),
          ]),
          noDataColor,
        ],
        noDataColor,
      ],
      "fill-opacity": 0.7,
      "fill-outline-color": lineColor,
    },
    minzoom: 0,
    maxzoom: 22,
    interactive: true,
  };

  const nivel2Layer = {
    // id: "nivel2-layer",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["has", "codigo_uni"],
        [
          "match",
          ["get", "codigo_uni"],
          ...Object.entries(governments || {}).flatMap(([key, value]) => [
            key,
            getColorForValue(value.value),
          ]),
          noDataColor,
        ],
        noDataColor,
      ],
      "fill-opacity": 0.7,
      "fill-outline-color": lineColor,
    },
    minzoom: 0,
    maxzoom: 22,
    interactive: true,
  };

  const nivel3Layer = {
    id: "nivel3-layer",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["has", "codigo_uni"],
        [
          "match",
          ["get", "codigo_uni"],
          ...Object.entries(governments || {}).flatMap(([key, value]) => [
            key,
            getColorForValue(value.value),
          ]),
          noDataColor,
        ],
        noDataColor,
      ],
      "fill-opacity": 0.7,
      "fill-outline-color": lineColor,
    },
    minzoom: 0,
    maxzoom: 22,
    interactive: true,
  };

  // Add country filter to layers when a specific country is selected
  if (selectedCountryIso3 !== "all" && localType !== "region") {
    nivel1Layer.filter = ["==", ["get", "GID_0"], selectedCountryIso3];
    nivel2Layer.filter = ["==", ["get", "GID_0"], selectedCountryIso3];
    nivel3Layer.filter = ["==", ["get", "GID_0"], selectedCountryIso3];
  } else {
    // Handle special cases only when no specific country is selected
    if (localType === "default" || localType === "all") {
      nivel3Layer.filter = ["==", ["get", "GID_0"], "PER"];
      nivel2Layer.filter = ["!=", ["get", "GID_0"], "PER"];
    }
    if (localType === "SLV" || localType === "DOM" || localType === "HTI") {
      nivel3Layer.filter = ["==", ["get", "GID_0"], localType];
    }
    if (localType === "region") {
      // Filter layers to only show countries in the selected region
      const regionCountries = getCountriesInRegion;
      nivel1Layer.filter = [
        "in",
        ["get", "GID_0"],
        ["literal", regionCountries],
      ];
      nivel2Layer.filter = [
        "in",
        ["get", "GID_0"],
        ["literal", regionCountries],
      ];
      nivel3Layer.filter = [
        "in",
        ["get", "GID_0"],
        ["literal", regionCountries],
      ];
    }
  }

  const nivel1LayerTooltip = {
    id: "nivel1LayerTooltip",
    type: "fill",
    paint: {
      "fill-color": "transparent",
      "fill-opacity": 0,
    },
    interactive: true,
  };
  const [tooltip, setTooltip] = useState();
  // Handle hover events for tooltips
  const onMouseMove = (event) => {
    const feature = event.features && event.features[0];

    if (
      feature &&
      feature.properties &&
      feature.properties.codigo_uni &&
      governments[feature.properties.codigo_uni]
    ) {
      const map = mapRef.current && mapRef.current.getMap();
      const { x, y } = map.project([event.lngLat.lng, event.lngLat.lat]);    
      if (
        governments[feature.properties.codigo_uni].value !== undefined && 
        governments[feature.properties.codigo_uni].value !== null && 
        typeof governments[feature.properties.codigo_uni].value === "number"    
      ) {
        const originalValue = governments[feature.properties.codigo_uni].value;
        const displayValue = isPercentage
          ? parseFloat((originalValue * 100).toFixed(2)) + " %"
          : `${originalValue.toLocaleString(
              lang === "es" || lang === "pt" ? "es" : "en"
            )}
              ${indicator.unit_measure_id === "km2" ? "km2" : ""}`;

        setTooltip({
          governmentCode: governments[feature.properties.codigo_uni].fullName,
          value: displayValue,
          x: x,
          y: y,
        });
      } else {
        setTooltip({
          governmentCode: governments[feature.properties.codigo_uni].fullName,
          value: getTextById(copy, "no_data", lang),
          x: x,
          y: y,
        });
      }
    } else {
      setTooltip(null);
    }
  };

  const onMouseLeave = () => {
    setTooltip(null);
  };

  const onZoomOrPan = () => {
    setTooltip(null);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Map
        ref={mapRef}
        {...basicSettings}
        onLoad={handleLoad}
        // initialViewState={latinAmericaView}
        style={{ width: "100%", height: "100%" }}
        minZoom={1}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onZoom={onZoomOrPan}
        onMove={onZoomOrPan}
        maxZoom={22}
        interactiveLayerIds={[
          "nivel1-layer",
          "nivel2-layer",
          "nivel3-layer",
          "nivel2-layer_simplificado",
        ]}
      >
        <NavigationControl position="bottom-left" />
        {/* Nivel 0 - Visible at low zoom levels */}
        {/* <Source
          id="nivel0-source"
          type="vector"
          url="mapbox://dis-caf.4eo2m2u3"
        >
          <Layer {...nivel0Layer} source-layer="countries_sm-2an4y3" />
        </Source> */}

        {/* Nivel 1 - Visible at low zoom levels */}
        {selectedNivel.value === "1" && (
          <Source
            id="nivel1-source"
            type="vector"
            url="mapbox://dis-caf.3i72hiat"
          >
            <Layer {...nivel1LayerTooltip} source-layer="nivel_1-7n3yuu" />
            <Layer {...nivel1Layer} source-layer="nivel_1-7n3yuu" />
          </Source>
        )}
        {/* Nivel 2 - Visible at medium zoom levels */}
        {selectedNivel.value === "2" && (
          <>
            <Source
              id="nivel2-source"
              type="vector"
              url="mapbox://dis-caf.5o44vlx3"
            >
              <Layer
                id="nivel2-layer"
                {...nivel2Layer}
                source-layer="nivel_2-721y7u"
              />
            </Source>
            <Source
              id="nivel_2_simplificado"
              type="vector"
              url="mapbox://dis-caf.08mh2vhh"
            >
              <Layer
                id="nivel2-layer_simplificado"
                {...nivel2Layer}
                source-layer="nivel_2_simplificado"
              />
            </Source>
          </>
        )}

        {/* Show Peru's level 3 data when selectedCountryIso3 is "all" */}
        {(((localType === "all" || localType === "region") &&
          selectedNivel.value === "2") ||
          ((localType === "PER" ||
            localType === "SLV" ||
            localType === "DOM" ||
            localType === "HTI") &&
            selectedNivel.value === "3")) && (
          <Source
            id="peru-nivel3-source"
            type="vector"
            url="mapbox://dis-caf.1yjc4k9u"
          >
            <Layer {...nivel3Layer} source-layer="nivel_3-2264x6" />
          </Source>
        )}
      </Map>
      {/* Legend */}
      {colorScale && (
        <div className="top-m absolute right-m border-black border-1 px-s py-xs bg-white max-md:w-[95%]">
          <div className="flex gap-s items-center">
            <div className="flex gap-xxs flex-col w-[100px]">
              <div
                className="border-1 border-CA h-[10px] w-full"
                style={{ background: noDataColor }}
              />
              <span className="text-black text-[10px]">
                {getTextById(copy, "no_data", lang)}
              </span>
            </div>
            <div className="flex gap-xxs w-full flex-col">
              <div className="w-full flex items-center h-[10px]">
                <div
                  className="border-CAF w-full border-t-1 border-b-1 border-r-0 border-l-1 h-full"
                  style={{
                    background: `linear-gradient(to right, ${d3.interpolateBlues(
                      0
                    )}, ${d3.interpolateBlues(0.25)}, ${d3.interpolateBlues(
                      0.5
                    )}, ${d3.interpolateBlues(0.75)}, ${d3.interpolateBlues(
                      1
                    )})`,
                  }}
                />
              {!isPercentage && colorScale.isLogarithmic &&  <div className=" h-[8px]">
                  <div
                    style={{ borderLeftColor: d3.interpolateBlues(1) }}
                    className={`w-0 h-0 border-[4px] border-transparent border-r-0 border-l-[8px] border-l-[${d3.interpolateBlues(
                      1
                    )}]`}
                  />
                </div>}
              </div>
              <div className="text-black flex gap-s justify-between w-full text-[10px]">
                {!isPercentage && colorScale.isLogarithmic ? (
                  // Show intermediate values for logarithmic scale
                  colorScale.ticks.map((tick, i) => (
                    <span key={i}>
                      {i === colorScale.ticks.length - 1 ? (
                        <>
                          {tick.toLocaleString(
                            lang === "es" || lang === "pt" ? "es" : "en"
                          )}
                          {indicator.unit_measure_id === "km2" ? " km2" : ""}
                       
                        </>
                      ) : (
                        <>
                          {tick.toLocaleString(
                            lang === "es" || lang === "pt" ? "es" : "en"
                          )}
                          {indicator.unit_measure_id === "km2" ? " km2" : ""}
                        </>
                      )}
                    </span>
                  ))
                ) : (
                  // Original percentage scale
                  <>
                    <span>
                      {isPercentage
                        ? parseFloat(
                            (colorScale.scale.domain()[0] * 100).toFixed(2)
                          ) + " %"
                        : colorScale.scale.domain()[0] > 100
                        ? colorScale.scale
                            .domain()[0]
                            .toLocaleString(
                              lang === "es" || lang === "pt" ? "es" : "en"
                            )
                        : colorScale.scale.domain()[0].toFixed(2)}{" "}
                      {indicator.unit_measure_id === "km2" ? "km2" : ""}
                    </span>
                    <span>
                      {isPercentage
                        ? parseFloat(
                            (colorScale.scale.domain()[1] * 100).toFixed(2)
                          ) + " %"
                        : colorScale.scale.domain()[1] > 100
                        ? colorScale.scale
                            .domain()[1]
                            .toLocaleString(
                              lang === "es" || lang === "pt" ? "es" : "en"
                            )
                        : colorScale.scale.domain()[1].toFixed(2)}{" "}
                      {indicator.unit_measure_id === "km2" ? "km2" : ""}
                      {isPercentage &&
                      indicator.max !== undefined &&
                      colorScale.scale.domain()[1] * 100 < 100
                        ? lang === "es"
                          ? " o más"
                          : lang === "pt"
                          ? " ou mais"
                          : " or more"
                        : ""}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Tooltip popup */}
      {tooltip && (
        <div
          className="tooltip flex flex-col gap-xs font-[Raleway] absolute bg-white max-w-[300px] border-1 border-[#212529] p-s pointer-events-none"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            opacity: 1,
          }}
        >
          <p className="description text-black font-bold">
            {tooltip.governmentCode}
          </p>
          <p className="description text-black font-normal">{tooltip.value}</p>
        </div>
      )}
    </div>
  );
}

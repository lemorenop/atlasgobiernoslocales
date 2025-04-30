"use client";
import {
  handleMapLoad,
  lineColor,
  noDataColor,
  basicSettings,
  latinAmericaView,
} from "@/app/utils/mapSettings";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Map, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import * as d3 from "d3";
import { getTextById } from "@/app/utils/textUtils";

export default function MapIndicator({
  selectedNivel,
  data,
  governments,
  lang,
  selectedCountryIso3,
  countryCoordinates,
  copy,
  indicator
}) {
  const localType =
    selectedCountryIso3 !== "PER" &&
    selectedCountryIso3 !== "SLV" &&
    selectedCountryIso3 !== "HTI" &&
    selectedCountryIso3 !== "DOM"
      ? "default"
      : selectedCountryIso3 === "PER"
      ? "PER"
      : selectedCountryIso3 === "SLV"
      ? "SLV"
      : selectedCountryIso3 === "DOM"
      ? "DOM"
      : selectedCountryIso3 === "HTI"
      ? "HTI"
      : "";
  const mapRef = useRef();

  const isPercentage = indicator[`description_${lang}`].charAt(0) === "%";
  // Efecto para manejar el zoom al país seleccionado
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    // Si el país seleccionado es 'all', volver a la vista por defecto
    if (selectedCountryIso3 === "all") {
      map.fitBounds(
        [
          [latinAmericaView.longitude - 20, latinAmericaView.latitude - 20],
          [latinAmericaView.longitude + 20, latinAmericaView.latitude + 20],
        ],
        {
          padding: 50,
          duration: 1000,
        }
      );
      return;
    }

    // Si no hay coordenadas del país, no hacer nada
    if (!countryCoordinates) return;

    map.fitBounds(countryCoordinates, {
      padding: 50,
      duration: 1000,
    });
  }, [selectedCountryIso3, countryCoordinates]);

  // Crear escala de colores usando d3
  const colorScale = useMemo(() => {
    if (!data) return null;

    const values = Object.values(data)
      .map((item) => item.value)
      .filter((value) => value !== undefined && value !== null);

    if (values.length === 0) return null;

    return d3
      .scaleSequential()
      .domain([d3.min(values), d3.max(values)])
      .interpolator(d3.interpolateBlues);
  }, [data]);

  // Función para obtener el color basado en el valor
  const getColorForValue = useMemo(() => {
    if (!colorScale) return () => noDataColor;
    return (value) => {
      if (value === undefined || value === null) return noDataColor;
      return colorScale(value);
    };
  }, [colorScale]);

  function handleLoad() {
    return handleMapLoad(mapRef.current?.getMap(), lang);
  }

  // const isoA3List = tooltipData.map((item) => item.country_iso3); // Reemplaza con los códigos ISO_A3 que desees

  // console.log(Object.values(data))

  // Layer styles for each level using tilesets
  const nivel0Layer = {
    id: "nivel0-layer",
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": [
        'case',
        ['in', ['get', 'ISO_A3'], ['literal', Object.values(data).map((item) => item.government_id.slice(0,3))]],
        2.5,
        0
      ],
    },
    minzoom: 0,
    maxzoom: 22,
    interactive: true,
  };

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
          ...Object.entries(data || {}).flatMap(([key, value]) => [
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
    id: "nivel2-layer",
    type: "fill",
    paint: {
      "fill-color": [
        "case",
        ["has", "codigo_uni"],
        [
          "match",
          ["get", "codigo_uni"],
          ...Object.entries(data || {}).flatMap(([key, value]) => [
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
          ...Object.entries(data || {}).flatMap(([key, value]) => [
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

  if (localType === "default") {
    nivel3Layer.filter = ["==", ["get", "GID_0"], "PER"];
    nivel2Layer.filter = ["!=", ["get", "GID_0"], "PER"];
  }
  if (localType === "SLV") nivel3Layer.filter = ["==", ["get", "GID_0"], "SLV"];
  if (localType === "DOM") nivel3Layer.filter = ["==", ["get", "GID_0"], "DOM"];
  if (localType === "HTI") nivel3Layer.filter = ["==", ["get", "GID_0"], "HTI"];
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
  // Handle click events for tooltips
  const onClick = (event) => {
    const feature = event.features && event.features[0];
    if (feature && feature.properties && feature.properties.codigo_uni) {
      // console.log(feature);
      const map = mapRef.current && mapRef.current.getMap();
      const { x, y } = map.project([event.lngLat.lng, event.lngLat.lat]);
      if (
        data[feature.properties.codigo_uni] &&
        data[feature.properties.codigo_uni].value
      ) {
        // console.log(data[feature.properties.codigo_uni]);
        setTooltip({
          governmentCode: governments[feature.properties.codigo_uni].fullName,
          value: isPercentage ? data[feature.properties.codigo_uni].value * 100 + " %" : data[feature.properties.codigo_uni].value.toLocaleString(lang === "es" || lang === "pt" ? "es" : "en"),
          x: x,
          y: y,
        });
      } else
        setTooltip({
          governmentCode: governments[feature.properties.codigo_uni].fullName,
          value: getTextById(copy, "no_data", lang),
          x: x,
          y: y,
        });
    } else {
      setTooltip(null);
    }
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
        initialViewState={latinAmericaView}
        style={{ width: "100%", height: "100%" }}
        minZoom={4}
        onClick={onClick}
        onZoom={onZoomOrPan}
        onMove={onZoomOrPan}  
        maxZoom={22}
        interactiveLayerIds={["nivel1-layer", "nivel2-layer", "nivel3-layer"]}
      >
        <NavigationControl position="bottom-left" />
         {/* Nivel 0 - Visible at low zoom levels */}
         <Source
            id="nivel0-source"
            type="vector"
            url="mapbox://dis-caf.4eo2m2u3"
          >
            <Layer {...nivel0Layer} source-layer="countries_sm-2an4y3" />
          </Source>

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
            {" "}
            <Source
              id="nivel2-source"
              type="vector"
              url="mapbox://dis-caf.5o44vlx3"
            >
              <Layer {...nivel2Layer} source-layer="nivel_2-721y7u" />
            </Source>
            {/* Nivel 3 - Visible at high zoom levels */}
            {/* <Source
              id="nivel3-source"
              type="vector"
              url="mapbox://dis-caf.1yjc4k9u"
            >
              <Layer {...nivel3Layer} source-layer="nivel_3-2264x6" />
            </Source> */}
          </>
        )}

        {/* Show Peru's level 3 data when selectedCountryIso3 is "all" */}
        {localType === "default" && selectedNivel.value === "2" && (
          <Source
            id="peru-nivel3-source"
            type="vector"
            url="mapbox://dis-caf.1yjc4k9u"
          >
            <Layer {...nivel3Layer} source-layer="nivel_3-2264x6" />
          </Source>
        )}
        {(localType === "PER" ||
          localType === "SLV" ||
          localType === "DOM" ||
          localType === "HTI") &&
          selectedNivel.value === "3" && (
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
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            background: "white",
            padding: 8,
            borderRadius: 4,
            boxShadow: "0 2px 6px #0002",
          }}
        >
          <div style={{display:"flex", alignItems:"center", gap:4}}>
          <div
            className="border-1 border-CAF"
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
                style={{
                  width: 50,
                  height: 10,
                  background: noDataColor
                }}
              />
              </div>
              <div
            className="border-1 border-CAF"
            style={{ display: "flex", alignItems: "center" }}
          >
              <div
                style={{
                  width: 120,
                  height: 10,
                  background: `linear-gradient(to right, ${d3.interpolateBlues(0)}, ${d3.interpolateBlues(0.25)}, ${d3.interpolateBlues(0.5)}, ${d3.interpolateBlues(0.75)}, ${d3.interpolateBlues(1)})`,
                }}
              />
          </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:4}}>
          <div
            className="text-black"
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
            }}
          >
            <span style={{width: 50}}>no data</span>
          </div>
          <div
            className="text-black"
            style={{
              display: "flex",
              marginLeft: 4,
              width: "100%",
              justifyContent: "space-between",
              fontSize: 10,
            }}
          >
            <span>{isPercentage ? colorScale.domain()[0] * 100 + " %" : (colorScale.domain()[0] > 100 ? colorScale.domain()[0].toLocaleString(lang === "es" || lang === "pt" ? "es" : "en") :  colorScale.domain()[0].toFixed(2))}</span>
            <span>{isPercentage ? colorScale.domain()[1] * 100 + " %" : (colorScale.domain()[1] > 100 ? colorScale.domain()[1].toLocaleString(lang === "es" || lang === "pt" ? "es" : "en") :  colorScale.domain()[1].toFixed(2))}</span>
          </div>
        </div>
        </div>
      )}
      {/* Tooltip popup */}
      {tooltip && (
        <div
          className="tooltip flex flex-col gap-xs font-[Raleway]"
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

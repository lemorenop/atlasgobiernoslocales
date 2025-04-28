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

export default function MapIndicator({
  selectedNivel,
  data,
  governments,
  lang,
  selectedCountryIso3,
  countryCoordinates,
}) {
  const mapRef = useRef();
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

  const nivel1LayerTooltip = {
    id: "nivel1LayerTooltip",
    type: "fill",
    paint: {
      "fill-color": "transparent",
      "fill-opacity": 0,
    },
    interactive: true,
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
      >
        <NavigationControl position="bottom-left" />

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
            <Source
              id="nivel3-source"
              type="vector"
              url="mapbox://dis-caf.1yjc4k9u"
            >
              <Layer {...nivel3Layer} source-layer="nivel_3-2264x6" />
            </Source>
          </>
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
        
          <div   className="border-1 border-CAF" style={{ display: "flex", alignItems: "center" }}>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <div
                key={t}
                style={{
                  width: 30,
                  height: 10,
                  background: colorScale(
                    t * (colorScale.domain()[1] - colorScale.domain()[0]) +
                      colorScale.domain()[0]
                  ),
                }}
              />
            ))}
          </div>
          <div
          className="text-black"
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
            }}
          >
            <span>{colorScale.domain()[0].toFixed(2)}</span>
            <span>{colorScale.domain()[1].toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

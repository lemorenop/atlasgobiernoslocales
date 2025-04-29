"use client"; // si usás App Router

import { useState, useEffect, useRef } from "react";
import {
  Map,
  Source,
  Layer,
  NavigationControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchHomeMapTooltip } from "@/app/utils/apiClient";
import Loader from "./loader";
import { basicSettings, handleMapLoad } from "@/app/utils/mapSettings";

export default function MapView({ lang = "es" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltipData, setTooltipData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  // Fetch tooltip data
  useEffect(() => {
    const fetchTooltipData = async () => {
      try {
        const data = await fetchHomeMapTooltip();
        setTooltipData(data);
      } catch (error) {
        console.error("Error fetching tooltip data:", error);
      }
    };

    fetchTooltipData();
  }, []);

  // Update the initial view state to focus on Brazil
  const initialViewState = {
    longitude: -51.9253,
    latitude: -14.235,
    zoom: 4, // Adjusted zoom level for Brazil
    bounds: [
      [-74, 5],
      [-34, -34],
    ], // Adjusted to fit Brazil
    fitBoundsOptions: { padding: 20 },
  };

  // Get tooltip text based on country ISO3 and active language
  const getTooltipText = (countryIso3) => {
    const countryData = tooltipData.find(
      (item) => item.country_iso3 === countryIso3
    );
    if (!countryData) return "";

    // Return text based on active language
    switch (lang) {
      case "es":
        return countryData.text_es;
      case "en":
        return countryData.text_en;
      case "pt":
        return countryData.text_pr;
      default:
        return countryData.text_es; // Default to Spanish
    }
  };
  function handleLoad() {
    return handleMapLoad(mapRef.current?.getMap(), lang);
  }

  const isoA3List = tooltipData.map((item) => item.country_iso3); // Reemplaza con los códigos ISO_A3 que desees

  // Layer styles for each level using tilesets
  const nivel0Layer = {
    id: "nivel0-layer",
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": [
        'case',
        ['in', ['get', 'ISO_A3'], ['literal', isoA3List]],
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
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": 0.5,
    },
    minzoom: 0,
    maxzoom: 22,
    interactive: true,
  };

  const nivel2Layer = {
    id: "nivel2-layer",
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": 0.1,
    },
    minzoom: 4,
    maxzoom: 22,
    interactive: true,
  };

  const nivel3Layer = {
    id: "nivel3-layer",
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": 0.2,
    },
    minzoom: 5,
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

  const mapRef = useRef();

  const onClick = (event) => {
    const feature = event.features && event.features[0];
    // console.log(event.features);
    if (feature && feature.properties && feature.properties.GID_0) {
      // Show the tooltip for the new country
      setSelectedCountry(feature.properties.GID_0);
      setSelectedCoordinates([event.lngLat.lng, event.lngLat.lat]);
    } else {
      // If clicking on empty space, close the tooltip
      setSelectedCountry(null);
      setSelectedCoordinates(null);
    }
  };

  const onZoomOrPan = () => {
    setSelectedCountry(null);
    setSelectedCoordinates(null);
  };

  // Ensure map is loaded and selectedCoordinates is available
  const map = mapRef.current && mapRef.current.getMap();
  const pixelCoordinates =
    map && selectedCoordinates
      ? map.project(selectedCoordinates)
      : { x: 0, y: 0 };

  return (
    <div className="w-full h-full relative">
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : (
        <Map
          ref={mapRef}
          onLoad={handleLoad}
          initialViewState={initialViewState}
          onZoom={onZoomOrPan}
          onMove={onZoomOrPan}
          onClick={onClick}
          minZoom={1}
          maxZoom={22}
          interactiveLayerIds={[
            "nivel1LayerTooltip",
            "nivel1-layer",
            "nivel2-layer",
            "nivel3-layer",
          ]}
          {...basicSettings}
        >
          <NavigationControl position="top-right" />

          {/* Nivel 1 - Visible at low zoom levels */}
          <Source
            id="nivel0-source"
            type="vector"
            url="mapbox://dis-caf.4eo2m2u3"
          >
            <Layer {...nivel0Layer} source-layer="countries_sm-2an4y3" />
          </Source>

          {/* Nivel 1 - Visible at low zoom levels */}
          <Source
            id="nivel1-source"
            type="vector"
            url="mapbox://dis-caf.3i72hiat"
          >
            <Layer {...nivel1LayerTooltip} source-layer="nivel_1-7n3yuu" />
            <Layer {...nivel1Layer} source-layer="nivel_1-7n3yuu" />
          </Source>

          {/* Nivel 2 - Visible at medium zoom levels */}
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

          {/* Tooltip popup */}
          {selectedCountry && selectedCoordinates && (
            <div
              className="tooltip flex flex-col gap-xs"
              style={{
                top: pixelCoordinates.y,
                left: pixelCoordinates.x,
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
              <p className="description text-black font-normal font-[Raleway]">
                {getTooltipText(selectedCountry)}
              </p>
            </div>
          )}
        </Map>
      )}
    </div>
  );
}

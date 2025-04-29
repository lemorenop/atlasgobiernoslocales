"use client";

import { useState, useEffect, useRef } from "react";
import { Map, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { basicSettings, handleMapLoad } from "@/app/utils/mapSettings";

export default function MapGoverment({ nivel, governmentID, lang }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -58.3816,
    latitude: -34.6037,
    zoom: 4,
  });

  console.log(governmentID);

  const mapRef = useRef();

  useEffect(() => {
    try {
      setLoading(true);

      // Set default view state based on the nivel
      let defaultZoom = 4;
      let defaultLng = -58.3816;
      let defaultLat = -34.6037;

      // Adjust default view based on nivel
      switch (nivel) {
        case "1":
          defaultZoom = 4;
          break;
        case "2":
          defaultZoom = 6;
          break;
        case "3":
          defaultZoom = 8;
          break;
        default:
          throw new Error(`Nivel no válido: ${nivel}`);
      }

      // Set initial view state
      setViewState({
        longitude: defaultLng,
        latitude: defaultLat,
        zoom: defaultZoom,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error al configurar el mapa:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [nivel, governmentID]);

  // Function to center map on the jurisdiction when it's loaded
  const centerOnJurisdiction = () => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    // Query the features for the current jurisdiction
    const features = map.queryRenderedFeatures({
      layers: [`nivel1-layer`, `nivel2-layer`, `nivel3-layer`],
    });

    console.log(nivel);
    console.log(features);

    if (features && features.length > 0) {
      // Get the feature
      const feature = features[0];

      console.log(feature);

      // Use fitBounds to zoom to the feature's bounds with padding
      map.fitBounds(getBoundsFromFeature(feature), {
        padding: 50,
        maxZoom: 15, // Limit max zoom to prevent excessive zooming
      });
    }
  };

  // Helper function to extract bounds from a feature
  const getBoundsFromFeature = (feature) => {
    if (!feature.geometry) return null;

    // For polygons, we need to get the outer ring coordinates
    let coordinates;

    if (feature.geometry.type === "Polygon") {
      coordinates = feature.geometry.coordinates[0]; // Outer ring
    } else if (feature.geometry.type === "MultiPolygon") {
      // For MultiPolygon, we'll use the first polygon's outer ring
      coordinates = feature.geometry.coordinates[0][0];
    } else {
      return null;
    }

    // Calculate bounds
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    coordinates.forEach((coord) => {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    });

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
  };

  // Layer styles for each level using tilesets
  const nivel1Layer = {
    id: "nivel1-layer",
    type: "fill",
    paint: {
      "fill-color": "#55C7D5",
      "fill-opacity": 0.1,
      "fill-outline-color": "#1774AD",
      "fill-opacity-transition": { duration: 0 },
    },
    filter: ["==", ["get", "codigo_uni"], governmentID],
    minzoom: 0,
    maxzoom: 22,
  };

  const nivel2Layer = {
    id: "nivel2-layer",
    type: "fill",
    paint: {
      "fill-color": "#55C7D5",
      "fill-opacity": 0.1,
      "fill-outline-color": "#1774AD",
      "fill-opacity-transition": { duration: 0 },
    },
    filter: ["==", ["get", "codigo_uni"], governmentID],
    minzoom: 0,
    maxzoom: 22,
  };

  const nivel3Layer = {
    id: "nivel3-layer",
    type: "fill",
    paint: {
      "fill-color": "#55C7D5",
      "fill-opacity": 0.1,
      "fill-outline-color": "#1774AD",
      "fill-opacity-transition": { duration: 0 },
    },
    filter: ["==", ["get", "codigo_uni"], governmentID],
    minzoom: 0,
    maxzoom: 22,
  };

  function handleLoad() {
    const map = mapRef.current?.getMap();
    handleMapLoad(map, lang);

    // Wait a bit for the map to fully load and render the features
    setTimeout(() => {
      centerOnJurisdiction();
    }, 3000);
  }

  return (
    <div className="w-full h-full relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p>Cargando mapa...</p>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : (
        <Map
          ref={mapRef}
          onLoad={handleLoad}
          initialViewState={viewState}
          minZoom={nivel === "1" ? 1 : 4}
          maxZoom={22}
          {...basicSettings}
        >
          <NavigationControl position="top-right" />

          {/* Nivel 1 - Visible at low zoom levels */}
          {nivel === "1" && (
            <Source
              id="nivel1-source"
              type="vector"
              url="mapbox://dis-caf.3i72hiat"
            >
              <Layer {...nivel1Layer} source-layer="nivel_1-7n3yuu" />
            </Source>
          )}

          {/* Nivel 2 - Visible at medium zoom levels */}
          {nivel === "2" && (
            <Source
              id="nivel2-source"
              type="vector"
              url="mapbox://dis-caf.5o44vlx3"
            >
              <Layer {...nivel2Layer} source-layer="nivel_2-721y7u" />
            </Source>
          )}

          {/* Nivel 3 - Visible at high zoom levels */}
          {nivel === "3" && (
            <Source
              id="nivel3-source"
              type="vector"
              url="mapbox://dis-caf.1yjc4k9u"
            >
              <Layer {...nivel3Layer} source-layer="nivel_3-2264x6" />
            </Source>
          )}
        </Map>
      )}
    </div>
  );
}

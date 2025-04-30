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
  const [bounds, setBounds] = useState(null);

  const [minZoom, setMinZoom] = useState(1);

  const mapRef = useRef();

  useEffect(() => {
    const fetchBounds = async () => {
      const response = await fetch(
        `/api/bounds?govID=${governmentID}&nivel=${nivel}`
      );
      const data = await response.json();
      if (data) setBounds(data);
    };
    fetchBounds();
    try {
      setLoading(true);

      // Set default view state based on the nivel

      let defaultLng = -58.3816;
      let defaultLat = -34.6037;

      // Set initial view state
      setViewState({
        longitude: defaultLng,
        latitude: defaultLat,
        zoom: minZoom,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error al configurar el mapa:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [nivel, governmentID]);

  // Function to center map on the jurisdiction when it's loaded
  const centerOnJurisdiction = (map) => {
    if (bounds) {
      map.fitBounds(bounds.bounds, {
        padding: 50,
      });
    } else {
      let sourceId, sourceLayer;
      switch (nivel) {
        case "1":
          sourceId = "nivel1-source";
          sourceLayer = "nivel_1-7n3yuu";
          break;
        case "2":
          sourceId = "nivel2-source";
          sourceLayer = "nivel_2-721y7u";
          break;
        case "3":
          sourceId = "nivel3-source";
          sourceLayer = "nivel_3-2264x6";
          break;
        default:
          console.error("Nivel no válido:", nivel);
          return;
      }

      // Query the features for the current jurisdiction
      const features = map.queryRenderedFeatures({
        layers: [`nivel${nivel}-layer`],
      });

      if (features && features.length > 0) {
        // Get the feature
        const feature = features[0];
        map.fitBounds(getBoundsFromFeature(feature), {
          padding: 50,
        });
      } else {
        const sourceFeatures = map.querySourceFeatures(sourceId, {
          sourceLayer: sourceLayer,
          filter: ["==", ["get", "codigo_uni"], governmentID],
        });
        if (sourceFeatures && sourceFeatures.length > 0) {
          // Si encontramos características en la fuente, usarlas
          const feature = sourceFeatures[0];
          map.fitBounds(getBoundsFromFeature(feature), {
            padding: 50,
          });
        }
      }
    }

    // Consultar características directamente desde la fuente

    // if(nivel!==1)setMinZoom(4)
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
      "fill-opacity": 0.25,
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
      "fill-opacity": 0.25,
      "fill-outline-color": "#1774AD",
      "fill-opacity-transition": { duration: 0 },
    },
    filter: ["==", ["get", "codigo_uni"], governmentID],
    minzoom: 4,
    maxzoom: 22,
  };

  const nivel3Layer = {
    id: "nivel3-layer",
    type: "fill",
    paint: {
      "fill-color": "#55C7D5",
      "fill-opacity": 0.25,
      "fill-outline-color": "#1774AD",
      "fill-opacity-transition": { duration: 0 },
    },
    filter: ["==", ["get", "codigo_uni"], governmentID],
    minzoom: 0,
    minzoom: 0,
    maxzoom: 22,
  };

  function handleLoad() {
    const map = mapRef.current?.getMap();
    handleMapLoad(map, lang);

    // Esperar a que el mapa esté completamente cargado y las características renderizadas
    if (map) {
      // Y también después de un tiempo para asegurarse
      setTimeout(() => {
        centerOnJurisdiction(map);
      }, 1500);
    }
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
          minZoom={nivel === "2" ? 4 : 1}
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

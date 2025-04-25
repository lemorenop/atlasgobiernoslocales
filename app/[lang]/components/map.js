"use client"; // si usás App Router

import { useState, useEffect, useRef } from "react";
import { Map, Source, Layer, NavigationControl, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import * as topojson from "topojson-client";
import { fetchHomeMapTooltip } from "@/app/utils/apiClient";

// Import the JSON files directly
// Note: This approach works for smaller JSON files
// For larger files, we'll need to use a different approach
import nivel1Data from "../../../public/maps/nivel_1.json";
import nivel2Data from "../../../public/maps/nivel_2.json";
import nivel3Data from "../../../public/maps/nivel_3.json";
import Loader from "./loader";

export default function MapView({ lang = 'es' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState({
    nivel1: null,
    nivel2: null,
    nivel3: null,
  });
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
        console.error('Error fetching tooltip data:', error);
      }
    };

    fetchTooltipData();
  }, []);

  useEffect(() => {
    try {
      // For each level, we need to identify the objects to convert
      const nivel1Objects = Object.keys(nivel1Data.objects || {});
      const nivel2Objects = Object.keys(nivel2Data.objects || {});
      const nivel3Objects = Object.keys(nivel3Data.objects || {});

      // Convert each object to GeoJSON
      const nivel1GeoJson = nivel1Objects.map((obj) =>
        topojson.feature(nivel1Data, nivel1Data.objects[obj])
      );

      const nivel2GeoJson = nivel2Objects.map((obj) =>
        topojson.feature(nivel2Data, nivel2Data.objects[obj])
      );

      const nivel3GeoJson = nivel3Objects.map((obj) =>
        topojson.feature(nivel3Data, nivel3Data.objects[obj])
      );

      // Store the converted GeoJSON data
      setGeoJsonData({
        nivel1: nivel1GeoJson,
        nivel2: nivel2GeoJson,
        nivel3: nivel3GeoJson,
      });
    } catch (error) {
      console.error("Error converting TopoJSON to GeoJSON:", error);
      setError(error.message);
    }
  }, []);

  // Store the view state for Latin America
  const latinAmericaViewState = {
    longitude: -58.3816,
    latitude: -34.6037,
    zoom: 1,
    bounds: [[-116, 31], [-31, -57]], // Adjusted to fit Latin America
    fitBoundsOptions: { padding: 20 }
  };

  // Update the initial view state to focus on Brazil
  const [initialViewState, setInitialViewState] = useState({
    longitude: -51.9253,
    latitude: -14.2350,
    zoom: 4, // Adjusted zoom level for Brazil
    bounds: [[-74, 5], [-34, -34]], // Adjusted to fit Brazil
    fitBoundsOptions: { padding: 20 }
  });

  // Get tooltip text based on country ISO3 and active language
  const getTooltipText = (countryIso3) => {
    const countryData = tooltipData.find(item => item.country_iso3 === countryIso3);
    if (!countryData) return '';
    
    // Return text based on active language
    switch (lang) {
      case 'es':
        return countryData.text_es;
      case 'en':
        return countryData.text_en;
      case 'pt':
        return countryData.text_pr;
      default:
        return countryData.text_es; // Default to Spanish
    }
  };

  // Handle click events for tooltips
  const onClick = (event) => {
    const feature = event.features && event.features[0];
    console.log( event.features)
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

  // Layer styles for each level
  const nivel1Layer = {
    id: "nivel1-layer",
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": 0.5,
    },
    minzoom: 0,
    maxzoom: 3,
    interactive: true,
  };

  const nivel2Layer = {
    id: "nivel2-layer",
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": 0.5,
    },
    minzoom: 3,
    maxzoom: 22,
    interactive: true,
  };

  const nivel3Layer = {
    id: "nivel3-layer",
    type: "line",
    paint: {
      "line-color": "#55C7D5",
      "line-width": 0.5,
    },
    minzoom: 5,
    maxzoom: 22,
    interactive: true,
  };
  const nivel1LayerTooltip = {
    id: "nivel1LayerTooltip",
    type: "fill", // Cambiado de "line" a "fill"
    paint: {
      "fill-color": "transparent",
      "fill-opacity": 0, // Puedes ajustar la opacidad según tus necesidades
    },
 
    interactive: true,
  };
  const mapRef = useRef();

  const handleMapLoad = () => {
    const map = mapRef.current.getMap();
  
    // Muestra el nombre según el idioma activo del sitio (lang = 'es', 'en', 'fr', etc.)
    const field = `name_${lang}`;
    const fallbackField = 'name'; // Por si el idioma no está en la capa
  
    // Expresión que sobrescribe el nombre solo para las Islas Malvinas
    const customLabelExpression = [
      'case',
      // Comparar contra diferentes idiomas
      ['==', ['get', 'name'], 'Falkland Islands (Islas Malvinas)'], 'Islas Malvinas',
      ['==', ['get', 'name_en'], 'Falkland Islands (Islas Malvinas)'], 'Islas Malvinas',
      ['==', ['get', 'name_es'], 'Falkland Islands (Islas Malvinas)'], 'Islas Malvinas',
      ['==', ['get', 'name_pt'], 'Falkland Islands (Islas Malvinas)'], 'Islas Malvinas',
      // Si no coincide, usa el idioma activo si existe, si no el default
      ['has', field], ['get', field],
      ['get', fallbackField]
    ];
  
    map.getStyle().layers.forEach((layer) => {
      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
        map.setLayoutProperty(layer.id, 'text-field', customLabelExpression);
      }
    });
  };
  const onZoom = () => {
    setSelectedCountry(null);
    setSelectedCoordinates(null);
  };
  // Ensure map is loaded and selectedCoordinates is available
  const map = mapRef.current && mapRef.current.getMap();
  const pixelCoordinates = map && selectedCoordinates ? map.project(selectedCoordinates) : { x: 0, y: 0 };

  return (
    <div className="w-full h-full relative">
      {loading ? (
       <Loader/>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : (
      // <></>
        <Map
          ref={mapRef}
          onLoad={handleMapLoad}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/light-v11"
          projection="mercator"
          onZoom={onZoom}
          minZoom={1}
          maxZoom={22}
          interactiveLayerIds={['nivel1LayerTooltip']}
          onClick={onClick}
          dragRotate={false}
          touchRotate={false}
          pitchEnabled={false}
          attributionControl={false}
        >
          <NavigationControl position="top-right" />
          {geoJsonData.nivel1 &&
            geoJsonData.nivel1.map((feature, index) => (
              <Source
                key={`nivel1-${index}`}
                id={`nivel1-source-${index}`}
                type="geojson"
                data={feature}
              >
                <Layer {...nivel1LayerTooltip} />
              </Source>
            ))}
          {/* Nivel 1 - Visible at low zoom levels */}
          {geoJsonData.nivel1 &&
            geoJsonData.nivel1.map((feature, index) => (
              <Source
                key={`nivel1-${index}`}
                id={`nivel1-source-${index}`}
                type="geojson"
                data={feature}
              >
                <Layer {...nivel1Layer} />
              </Source>
            ))}

          {/* Nivel 2 - Visible at medium zoom levels */}
          {geoJsonData.nivel2 &&
            geoJsonData.nivel2.map((feature, index) => (
              <Source
                key={`nivel2-${index}`}
                id={`nivel2-source-${index}`}
                type="geojson"
                data={feature}
              >
                <Layer {...nivel2Layer} />
              </Source>
            ))}

          {/* Nivel 3 - Visible at high zoom levels */}
          {geoJsonData.nivel3 &&
            geoJsonData.nivel3.map((feature, index) => (
              <Source
                key={`nivel3-${index}`}
                id={`nivel3-source-${index}`}
                type="geojson"
                data={feature}
              >
                <Layer {...nivel3Layer} />
              </Source>
            ))}

          {/* Tooltip popup */}
          {selectedCountry && selectedCoordinates && (
            <div className="tooltip flex flex-col gap-xs"
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
              }}>
              <p className="description text-black font-normal font-[Raleway]">{getTooltipText(selectedCountry)}</p>
            </div>
          )}
        </Map>
      )}
    </div>
  );
}

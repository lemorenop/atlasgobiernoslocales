"use client"; // si usás App Router

import { useState, useEffect } from "react";
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



  const [initialViewState, setInitialViewState] = useState({
    longitude: -58.3816,
    latitude: -34.6037,
    zoom: 1,  bounds: [[-116, 31], [-31, -57]], // Adjusted to fit Latin America
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
    const feature = event.features[0];
    if (feature && feature.properties && feature.properties.GID_0) {
      // If clicking on the same country, close the tooltip
      if (selectedCountry === feature.properties.GID_0) {
        setSelectedCountry(null);
        setSelectedCoordinates(null);
      } else {
        // Otherwise, show the tooltip for the new country
        setSelectedCountry(feature.properties.GID_0);
        setSelectedCoordinates([event.lngLat.lng, event.lngLat.lat]);
      }
    } else {
      // If clicking on empty space, close the tooltip
      setSelectedCountry(null);
      setSelectedCoordinates(null);
    }
  };

  // Layer styles for each level
  const nivel1Layer = {
    id: "nivel1-layer",
    type: "fill",
    paint: {
      "fill-color": "#627BC1",
      "fill-opacity": 0.5,
      "fill-outline-color": "#627BC1",
    },
    minzoom: 0,
    maxzoom: 3,
  };

  const nivel2Layer = {
    id: "nivel2-layer",
    type: "fill",
    paint: {
      "fill-color": "#4CAF50",
      "fill-opacity": 0.5,
      "fill-outline-color": "#4CAF50",
    },
    minzoom: 3,
    maxzoom: 5,
  };

  const nivel3Layer = {
    id: "nivel3-layer",
    type: "fill",
    paint: {
      "fill-color": "#FF9800",
      "fill-opacity": 0.5,
      "fill-outline-color": "#FF9800",
    },
    minzoom: 5,
    maxzoom: 22,
  };

  return (
    <div className="w-full h-full relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p>Cargando mapas...</p>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : (
      // <></>
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/light-v11"
          projection="mercator"
          minZoom={1}
          maxZoom={22}
          interactiveLayerIds={['nivel1-layer', 'nivel2-layer', 'nivel3-layer']}
          onClick={onClick}
        >
          <NavigationControl position="top-right" />

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
            <Popup
              longitude={selectedCoordinates[0]}
              latitude={selectedCoordinates[1]}
              closeButton={true}
              closeOnClick={false}
              anchor="bottom"
              onClose={() => {
                setSelectedCountry(null);
                setSelectedCoordinates(null);
              }}
            >
              <div className="p-2 max-w-xs">
                <p className="text-sm">{getTooltipText(selectedCountry)}</p>
              </div>
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
}

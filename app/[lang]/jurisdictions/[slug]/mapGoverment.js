"use client";

import { useState, useEffect } from "react";
import { Map, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import * as topojson from "topojson-client";

// Import the JSON files directly
import nivel1Data from "../../../../public/maps/nivel_1.json";
import nivel2Data from "../../../../public/maps/nivel_2.json";
import nivel3Data from "../../../../public/maps/nivel_3.json";

export default function MapGoverment({ nivel, governmentID }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -58.3816,
    latitude: -34.6037,
    zoom: 4,
  });

  useEffect(() => {
    try {
      setLoading(true);
      
      // Select the appropriate data based on the nivel parameter
      let data;
      switch (nivel) {
        case "1":
          data = nivel1Data;
          break;
        case "2":
          data = nivel2Data;
          break;
        case "3":
          data = nivel3Data;
          break;
        default:
          throw new Error(`Nivel no válido: ${nivel}`);
      }

      // Get the objects from the TopoJSON data
      const objects = Object.keys(data.objects || {});
      
      // Convert each object to GeoJSON
      const geoJsonFeatures = objects.map((obj) =>
        topojson.feature(data, data.objects[obj])
      );
      
      // Find the feature that matches the governmentID
      let targetFeature = null;
      
      for (const feature of geoJsonFeatures) {
        // Check if any feature in the GeoJSON has the matching codigo_uni
        const matchingFeature = feature.features.find(
          (f) => f.properties.codigo_uni === governmentID
        );
        
        if (matchingFeature) {
          targetFeature = matchingFeature;
          break;
        }
      }
      
      if (!targetFeature) {
        throw new Error(`No se encontró la geometría para el gobierno con ID: ${governmentID}`);
      }
      
      // Set the GeoJSON data
      setGeoJsonData(targetFeature);
      
      // Calculate the center of the feature for the map view
      if (targetFeature.geometry.type === "Polygon" || targetFeature.geometry.type === "MultiPolygon") {
        // For polygons, calculate the centroid
        const coordinates = targetFeature.geometry.type === "Polygon" 
          ? targetFeature.geometry.coordinates[0] 
          : targetFeature.geometry.coordinates[0][0];
        
        let sumLng = 0;
        let sumLat = 0;
        let count = 0;
        
        coordinates.forEach(coord => {
          sumLng += coord[0];
          sumLat += coord[1];
          count++;
        });
        
        if (count > 0) {
          setViewState({
            longitude: sumLng / count,
            latitude: sumLat / count,
            zoom: 6,
          });
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar la geometría:", error);
      setError(error.message);
      setLoading(false);
    }
  }, [nivel, governmentID]);

  // Layer style for the government shape
  const governmentLayer = {
    id: "government-layer",
    type: "fill",
    paint: {
      "stroke-color": "#1774AD",
      "stroke-width": 2,
      "fill-color": "#55C7D5",
      "fill-opacity": 0.1,
      "fill-outline-color": "#627BC1",
    },
  };

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
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={viewState}
          mapStyle="mapbox://styles/mapbox/light-v11"
          projection="mercator"
          minZoom={1}
          maxZoom={22}
        >
          <NavigationControl position="top-right" />

          {/* Government shape */}
          {geoJsonData && (
            <Source
              id="government-source"
              type="geojson"
              data={geoJsonData}
            >
              <Layer {...governmentLayer} />
            </Source>
          )}
        </Map>
      )}
    </div>
  );
}



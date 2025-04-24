"use client";

import { useState, useEffect } from "react";
import { Map, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import * as topojson from "topojson-client";

// Import the JSON files directly
import nivel1Data from "../../../public/maps/nivel_1.json";
import nivel2Data from "../../../public/maps/nivel_2.json";
import nivel3Data from "../../../public/maps/nivel_3.json";

export default function MapIndicator() {
  return <div>Map</div>;
}


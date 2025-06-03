export const handleMapLoad = (
  map, // mapRef
  lang
) => {
  const VISIBLE_LAYERS = [
    // 'continent-layer',
    // 'state-label',
    "country-label","admin-0-boundary"
    // "settlement-major-label",
    // "settlement-minor-label"
  ];

  if (map) {
    // Muestra el nombre según el idioma activo del sitio (lang = 'es', 'en', 'fr', etc.)
    const field = `name_${lang}`;
    const fallbackField = "name"; // Por si el idioma no está en la capa

    // Expresión que sobrescribe el nombre solo para las Islas Malvinas
    const customLabelExpression = [
      "case",
      // Comparar contra diferentes idiomas
      ["==", ["get", "name"], "Falkland Islands (Islas Malvinas)"],
      "Islas Malvinas",
      ["==", ["get", "name_en"], "Falkland Islands (Islas Malvinas)"],
      "Islas Malvinas",
      ["==", ["get", "name_es"], "Falkland Islands (Islas Malvinas)"],
      "Islas Malvinas",
      ["==", ["get", "name_pt"], "Falkland Islands (Islas Malvinas)"],
      "Islas Malvinas",
      // Si no coincide, usa el idioma activo si existe, si no el default
      ["has", field],
      ["get", field],
      ["get", fallbackField],
    ];

    map.getStyle().layers.forEach((layer) => {
      if (layer.type === "symbol" && layer.layout?.["text-field"]) {
        if (VISIBLE_LAYERS.includes(layer.id)) {
          map.setLayoutProperty(layer.id, "text-field", customLabelExpression);
          map.setLayoutProperty(layer.id, "visibility", "visible");
        } else {
          // map.setLayoutProperty(layer.id, "visibility", "none");
        }
      }
    });
  }
};
export const lineColor = "#55C7D5";
// export const noDataColor="#AECDD5"
export const noDataColor = "#97ABC4";

export const basicSettings = {
  mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_STYLE_TOKEN,
  dragRotate: false,
  touchRotate: false,
  pitchEnabled: false,
  attributionControl: false,
  mapStyle: "mapbox://styles/dis-caf/cmawl4gc200f001s30il4gsj0",
  projection:"mercator"
};
export const latinAmericaView = {
  longitude: -53.09102246964113,
  latitude: -12.994618925386675,
  // zoom: 1, // Adjusted to fit Latin America
  fitBoundsOptions: { padding: 20 },
};

export const defaultView = {
  0: [-90.0, -38.0],  // Oeste: -82° para mostrar todo el continente, Sur: -38° para cortar en la Pampa
  1: [-34.0, 23.0]    // Este: -34° para mostrar toda la costa este, Norte: 23° para mostrar Cuba completa
}

export const southAmericaBounds = {
  0: [-82.0, -56.0],
  1: [-34.0, 13.0]
}
export const caribbeanBounds = {
  0: [-89.0, 9.5],
  1: [-59.0, 27.5]
}
export const centralAmericaBounds = {
  0: [-118.5, 5.5],
  1: [-82.0, 33.0]
}
export const latinAmericaBounds =  {
  0: [-120.0, -56.0], // suroeste: costa del Pacífico de México hasta el sur de Chile
  1: [-30.0, 33.0]    // noreste: Caribe y noreste de Brasil
}

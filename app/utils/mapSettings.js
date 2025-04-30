export const handleMapLoad = (
    map, // mapRef    
    lang) => {


const VISIBLE_LAYERS = [
  'continent-layer',
  'state-label',
  'country-label',
  "settlement-major-label",
  "settlement-minor-label"
];
        
  if(map){
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
        // console.log(layer.id);
        if (VISIBLE_LAYERS.includes(layer.id)) {
          map.setLayoutProperty(layer.id, 'text-field', customLabelExpression);
          map.setLayoutProperty(layer.id, 'visibility', 'visible');
        } else {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      }
    });
  }
};
export const lineColor="#55C7D5"
// export const noDataColor="#AECDD5"
export const noDataColor="#97ABC4"

export const basicSettings={
    mapboxAccessToken:process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    dragRotate:false,   
    touchRotate:false,
    pitchEnabled:false,
    attributionControl:false,
    mapStyle:"mapbox://styles/mapbox/light-v11",
    projection:"mercator"
}
export const latinAmericaView= {
    longitude: -53.09102246964113,
    latitude: -12.994618925386675,
    zoom: 1,
    bounds: [
      [-116, 31],
      [-31, -57],
    ], // Adjusted to fit Latin America
    fitBoundsOptions: { padding: 20 },
  };
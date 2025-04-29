const L2 = require('./nivel_2.json')
const L3 = require('./nivel_3.json')
const L1 = require('./nivel_1.json')
const fs = require('fs');
const path = require('path');
const feature = require('topojson-client').feature;
/**
 * Converts a TopoJSON object to GeoJSON
 * @param {Object} topojsonObject - The TopoJSON object to convert
 * @param {String} objectName - The name of the object to extract from the TopoJSON
 * @returns {Object} - The converted GeoJSON object
 */

function convertToGeojson(topojsonObject, objectName) {
    console.log(topojsonObject.objects)
  const geojsonFeatureCollection = feature(topojsonObject, topojsonObject.objects[objectName]);
  return geojsonFeatureCollection;
}

/**
 * Extracts bounding coordinates for each geometry in a GeoJSON
 * @param {Object} geojson - The GeoJSON containing features
 * @returns {Object} - Object with codigo_uni as keys and bounding coordinates as values
 */
function extractGeometryBounds(geojson) {
  const boundsByCode = {};
  
  // Check if the JSON has the expected structure
  if (!geojson || !geojson.features) {
    console.error('Invalid GeoJSON structure');
    return boundsByCode;
  }
  
  // Process each feature in the GeoJSON
  geojson.features.forEach(feature => {
    // Check if the feature has the codigo_uni property
    if (feature.properties && feature.properties.codigo_uni) {
      const code = feature.properties.codigo_uni;
      
      // Extract coordinates based on geometry type
      let coordinates = [];
      
      if (feature.geometry.type === 'Polygon') {
        // For Polygon, use the outer ring coordinates
        coordinates = feature.geometry.coordinates[0];
      } else if (feature.geometry.type === 'MultiPolygon') {
        // For MultiPolygon, flatten all outer rings
        feature.geometry.coordinates.forEach(polygon => {
          coordinates = coordinates.concat(polygon[0]);
        });
      }
      
      // Calculate bounds if we have coordinates
      if (coordinates.length > 0) {
        const lngs = coordinates.map(coord => coord[0]);
        const lats = coordinates.map(coord => coord[1]);
        
        const bounds = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)]
        ];
        
        // Store the bounds with the codigo_uni as the key
        boundsByCode[code] = bounds;
      }
    }
  });
  
  console.log(`Processed ${Object.keys(boundsByCode).length} features`);
  return boundsByCode;
}

/**
 * Process a TopoJSON file and save the bounds to a JSON file
 * @param {Object} topojson - The TopoJSON object
 * @param {String} objectName - The name of the object to extract from the TopoJSON
 * @param {String} outputFileName - The name of the output file
 */
function processTopoJSON(topojson, objectName, outputFileName) {
  console.log(`Processing ${objectName}...`);
  const geojson = convertToGeojson(topojson, objectName);
  const boundsByCode = extractGeometryBounds(geojson);
  
  // Save the result to a file
  const outputPath = path.join(__dirname, outputFileName);
  fs.writeFileSync(outputPath, JSON.stringify(boundsByCode, null, 2));
  console.log(`Bounds saved to ${outputPath}`);
  
  return boundsByCode;
}

// Process all three levels
// const boundsL1 = processTopoJSON(L1, 'Niv 1 - Geo - 100', 'nivel_1_bounds.json');
// const boundsL2 = processTopoJSON(L2, 'Niv 2 - Geo - 100', 'nivel_2_bounds.json');
const boundsL3 = processTopoJSON(L3, 'nive3', 'nivel_3_bounds.json');

// Export all results
module.exports = {
//   boundsL1,
//   boundsL2,
  boundsL3
};

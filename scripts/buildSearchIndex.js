const fs = require('fs');
const path = require('path');

// Importar los datos de gobiernos
const governmentEs = require('../app/utils/governments/governments_es.json');
const governmentEn = require('../app/utils/governments/governments_en.json');
const governmentPt = require('../app/utils/governments/governments_pt.json');

const govs = { es: governmentEs, en: governmentEn, pt: governmentPt };
const locales = ["es", "en", "pt"];

console.log('🔍 Building search index configuration...');

function buildSearchIndexConfig() {
  const config = {};

  for (const locale of locales) {
    console.log(`🏳️ Processing ${locale} locale...`);
    
    // Crear un mapeo optimizado para búsqueda rápida
    const searchData = govs[locale].map(item => ({
      id: item.id,
      name: item.name,
      parentName: item.parentName,
      countryName: item.countryName,
      completeName: item.completeName,
      countryCode: item.countryCode,
      nivel: item.nivel,
      // Crear un campo de búsqueda combinado para mejor rendimiento
      searchText: `${item.name} ${item.parentName || ''} ${item.countryName || ''} ${item.completeName || ''}`.toLowerCase()
    }));

    config[locale] = {
      count: searchData.length,
      data: searchData,
      // Crear índices de búsqueda por país y nivel para filtrado rápido
      byCountry: {},
      byNivel: {}
    };

    // Crear índices secundarios
    searchData.forEach(item => {
      // Índice por país
      if (item.countryCode) {
        if (!config[locale].byCountry[item.countryCode]) {
          config[locale].byCountry[item.countryCode] = [];
        }
        config[locale].byCountry[item.countryCode].push(item.id);
      }

      // Índice por nivel
      if (item.nivel) {
        if (!config[locale].byNivel[item.nivel]) {
          config[locale].byNivel[item.nivel] = [];
        }
        config[locale].byNivel[item.nivel].push(item.id);
      }
    });

    console.log(`✅ Processed ${searchData.length} elements for ${locale}`);
  }

  // Crear el directorio si no existe
  const outputDir = path.join(__dirname, '../app/utils/searchIndexes');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Guardar la configuración
  const outputPath = path.join(outputDir, 'searchConfig.json');
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));
  
  console.log(`✅ Search configuration saved to ${outputPath}`);
  console.log('🎉 Search index configuration build completed!');
}

buildSearchIndexConfig(); 
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const csv = require('csv-parser');
const { Readable } = require('stream');

// URLs for the spreadsheets
const GOVERNMENTS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=490903592&single=true&output=csv';
const COUNTRIES_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTshMm_LWq6GwRRjSxuq1DyflJGr8eC-d0cO0zIBFc6sDJZ_TiDZu-JhLrxusIaAw/pub?gid=2138553854&single=true&output=csv';

// Function to download CSV data
async function downloadCSV(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error downloading CSV from ${url}:`, error);
    throw error;
  }
}

// Function to parse CSV data
function parseCSV(csvData) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    Readable.from(csvData)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Function to create index files for all languages
async function createIndexFiles() {
  try {
    // Download and parse governments data
    const governmentsCSV = await downloadCSV(GOVERNMENTS_URL);
    const governments = await parseCSV(governmentsCSV);
    
    // Download and parse countries data
    const countriesCSV = await downloadCSV(COUNTRIES_URL);
    const countries = await parseCSV(countriesCSV);
    
    // Create a map of countries by ISO3 code
    const countriesMap = countries.reduce((map, country) => {
      map[country.iso3] = country;
      return map;
    }, {});
    
    // Create a map of governments by ID for easy lookup
    const governmentsMap = governments.reduce((map, gov) => {
      map[gov.id] = gov;
      return map;
    }, {});
    
    // Language configurations
    const languageConfigs = [
      { 
        lang: 'es', 
        countryNameField: 'name_es', 
        completeNameField: 'description_es' 
      },
      { 
        lang: 'en', 
        countryNameField: 'name_en', 
        completeNameField: 'description_en' 
      },
      { 
        lang: 'pt', 
        countryNameField: 'name_pt', 
        completeNameField: 'description_pt' 
      }
    ];
    
    // Create directory if it doesn't exist
    const outputDir = path.resolve(__dirname, '../public/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate files for each language
    for (const config of languageConfigs) {
      const resultArray = governments.map(gov => {
        const parentId = gov.parent_government_id;
        const parentGov = parentId ? governmentsMap[parentId] : null;
        const country = countriesMap[gov.country_iso3];
        
        return {
          id: gov.id,
          name: gov.name,
          nivel:gov.level_per_country_id.split('_')[0],
          parentName: parentGov ? parentGov.name : '',
          countryName: country ? country[config.countryNameField] : '',
          completeName: gov[config.completeNameField] || '',
          fullName: gov.name + ', ' + gov[config.completeNameField]
        };
      });
      
      // Write the JSON file
      fs.writeFileSync(
        path.join(outputDir, `governments_${config.lang}.json`), 
        JSON.stringify(resultArray, null, 2)
      );
     
    }
    
  } catch (error) {
    console.error('Error creating index files:', error);
  }
}

// Run the function
createIndexFiles();

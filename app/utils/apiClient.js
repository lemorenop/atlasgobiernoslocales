/**
 * Cliente de API para centralizar todas las llamadas a las APIs
 */

/**
 * Obtiene los datos de los gobiernos
 * @returns {Promise<Array>} - Array de objetos de gobierno
 */
export async function fetchGovernments() {
  const response = await fetch('/api/governments');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de gobiernos');
  }
  return response.json();
}

/**
 * Obtiene los datos de los indicadores
 * @returns {Promise<Array>} - Array de objetos de indicadores
 */
export async function fetchIndicators() {
  const response = await fetch('/api/indicators');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de indicadores');
  }
  return response.json();
}

/**
 * Obtiene todos los datos
 * @returns {Promise<Array>} - Array de objetos de datos
 */
export async function fetchAllData() {
  const response = await fetch('/api/all-data');
  if (!response.ok) {
    throw new Error('Error al obtener todos los datos');
  }
  return response.json();
}

/**
 * Obtiene los datos de años
 * @returns {Promise<Array>} - Array de objetos de datos de años
 */
export async function fetchYearData() {
  const response = await fetch('/api/year-data');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de años');
  }
  return response.json();
}

/**
 * Obtiene los datos de países
 * @returns {Promise<Array>} - Array de objetos de países
 */
export async function fetchCountries() {
  const response = await fetch('/api/countries');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de países');
  }
  return response.json();
}

/**
 * Obtiene los datos de regiones
 * @returns {Promise<Array>} - Array de objetos de regiones
 */
export async function fetchRegions() {
  const response = await fetch('/api/regions');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de regiones');
  }
  return response.json();
}

/**
 * Obtiene los datos de nivel por país
 * @returns {Promise<Array>} - Array de objetos de nivel por país
 */
export async function fetchLevelPerCountry() {
  const response = await fetch('/api/level-per-country');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de nivel por país');
  }
  return response.json();
}

/**
 * Obtiene los datos de contenido de la página de inicio
 * @returns {Promise<Array>} - Array de objetos de contenido de la página de inicio
 */
export async function fetchHomeCopy() {
  const response = await fetch('/api/home-copy');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de contenido de la página de inicio');
  }
  return response.json();
}

/**
 * Obtiene los datos de la barra de navegación
 * @returns {Promise<Array>} - Array de objetos de la barra de navegación
 */
export async function fetchNavbarCopy() {
  const response = await fetch('http://localhost:3000/api/navbar-copy');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de la barra de navegación');
  }
  return response.json();
}
export async function fetchApi(url) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${url}`);
  if (!response.ok) {
    throw new Error('Error al obtener los datos de la barra de navegación');
  }
  return response.json();
}

/**
 * Obtiene los datos del pie de página
 * @returns {Promise<Array>} - Array de objetos del pie de página
 */
export async function fetchFooterCopy() {
  const response = await fetch('/api/footer-copy');
  if (!response.ok) {
    throw new Error('Error al obtener los datos del pie de página');
  }
  return response.json();
}

/**
 * Obtiene los datos de la página "Acerca de"
 * @returns {Promise<Array>} - Array de objetos de la página "Acerca de"
 */
export async function fetchAboutCopy() {
  const response = await fetch('/api/about-copy');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de la página "Acerca de"');
  }
  return response.json();
}

/**
 * Obtiene los datos de tooltip del mapa de la página de inicio
 * @returns {Promise<Array>} - Array de objetos de tooltip del mapa de la página de inicio
 */
export async function fetchHomeMapTooltip() {
  const response = await fetch('/api/home-map-tooltip');
  if (!response.ok) {
    throw new Error('Error al obtener los datos de tooltip del mapa de la página de inicio');
  }
  return response.json();
}

/**
 * Obtiene los datos de error de la página
 * @returns {Promise<Array>} - Array de objetos de error de la página
 */
export async function fetchPageError() {
  const response = await fetch('/api/page-error');  
  if (!response.ok) {
    throw new Error('Error al obtener los datos de error de la página');
  }
  return response.json();
}


/**
 * Obtiene los datos filtrados de una jurisdicción específica
 * @param {string} slug - ID de la jurisdicción
 * @returns {Promise<Object>} - Objeto con los datos filtrados de la jurisdicción
 */
export async function fetchJurisdictionData(slug) {
  const response = await fetch(`/api/jurisdiction/${slug}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Gobierno no encontrado');
    }
    throw new Error('Error al obtener los datos de la jurisdicción');
  }
  return response.json();
} 
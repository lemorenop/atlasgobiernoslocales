/**
 * Sistema de caché simple para almacenar datos en memoria
 */

// Almacén de caché
const cache = {
  data: {},
  timestamps: {},
  ttls: {}, // Almacena el TTL individual de cada entrada
  // Tiempo de expiración por defecto: 1 hora
  defaultTTL: 60 * 60 * 1000,
};

/**
 * Obtiene un valor del caché si existe y no ha expirado
 * @param {string} key - Clave del valor a obtener
 * @returns {any|null} - Valor almacenado o null si no existe o ha expirado
 *
 * Si el TTL es Infinity, el valor nunca expira.
 */
export function getFromCache(key) {
  const timestamp = cache.timestamps[key];
  const ttl = cache.ttls[key] || cache.defaultTTL;
  const now = Date.now();

  // Si el TTL es Infinity, nunca expira
  if (ttl === Infinity) {
    return cache.data[key];
  }
  // Si no existe en caché o ha expirado, devolver null
  if (!timestamp || now - timestamp > ttl) {
    return null;
  }
  return cache.data[key];
}

/**
 * Almacena un valor en el caché
 * @param {string} key - Clave para almacenar el valor
 * @param {any} value - Valor a almacenar
 * @param {number} ttl - Tiempo de vida en milisegundos (opcional)
 */
export function setInCache(key, value, ttl = cache.defaultTTL) {
  cache.data[key] = value;
  cache.timestamps[key] = Date.now();
  cache.ttls[key] = ttl;
}

/**
 * Limpia un valor específico del caché
 * @param {string} key - Clave del valor a limpiar
 */
export function clearFromCache(key) {
  delete cache.data[key];
  delete cache.timestamps[key];
  delete cache.ttls[key];
}

/**
 * Limpia todo el caché
 */
export function clearCache() {
  cache.data = {};
  cache.timestamps = {};
  cache.ttls = {};
}

/**
 * Devuelve una copia del contenido completo del caché
 */
export function getAllCache() {
  return cache;
} 
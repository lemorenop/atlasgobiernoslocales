export async function fetchGovernments(lang,responseType) {
  const response = await fetch(`/api/governments?lang=${lang}&responseType=${responseType}`);
  if (!response.ok) {
    throw new Error("Error al obtener los datos de gobiernos");
  }
  return response.json();
}
export async function fetchHomeMapTooltip() {
  const response = await fetch("/api/home-map-tooltip");
  if (!response.ok) {
    throw new Error(
      "Error al obtener los datos de tooltip del mapa de la página de inicio"
    );
  }
  return response.json();
}
export async function fetchJurisdictionData(slug) {
  const response = await fetch(`/api/jurisdiction/${slug}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Gobierno no encontrado: ${slug}`);
    }
    throw new Error("Error al obtener los datos de la jurisdicción");
  }
  return response.json();
}
export async function fetchIndicatorData(slug) {
  const response = await fetch(`/api/indicators/${slug}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Indicador no encontrado");
    }
    throw new Error("Error al obtener los datos del indicador");
  }
  return response.json();
}

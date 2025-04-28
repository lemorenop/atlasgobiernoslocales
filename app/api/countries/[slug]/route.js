import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { slug } = params;
  const geojson = await import("@/public/maps/world-stc.json");
  const feature = geojson.features.find((f) => f.properties.REF_AREA === slug);

  if (!feature) {
    return NextResponse.json({ error: "Country not found" }, { status: 404 });
  }

  const geometry = feature.geometry;

  // Obtener todas las coordenadas de todos los polígonos
  let allCoordinates = [];
  geometry.coordinates.forEach((polygon) => {
    allCoordinates = allCoordinates.concat(polygon[0]);
  });
  let bbox = null;
  if (allCoordinates.length > 0) {
    bbox = [
      [
        Math.min(...allCoordinates.map((p) => p[0])),
        Math.min(...allCoordinates.map((p) => p[1])),
      ],
      [
        Math.max(...allCoordinates.map((p) => p[0])),
        Math.max(...allCoordinates.map((p) => p[1])),
      ],
    ];
  }

  return NextResponse.json(bbox);
}

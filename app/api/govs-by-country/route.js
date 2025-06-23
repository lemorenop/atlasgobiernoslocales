import { NextResponse } from "next/server";
import { getGovernmentsByCountry } from "@/app/utils/dataFetchers";
import { getFromCache, setInCache } from "@/app/utils/cache";

export async function GET(request, { params }) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode");
    const level = searchParams.get("level");
    const lang = searchParams.get("lang");
    const codes = searchParams.get("codes");

    // Verificar si los datos filtrados ya están en caché
    const cacheKey = `governments_${countryCode}_${level}_${lang}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return NextResponse.json({ data: cachedData });
    }

    const data = await getGovernmentsByCountry(lang, codes, countryCode, level);

    // Almacenar en caché (con un TTL más corto para los datos filtrados)
    setInCache(cacheKey, data, 30 * 60 * 1000); // 30 minutos

    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Error fetching government data:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}

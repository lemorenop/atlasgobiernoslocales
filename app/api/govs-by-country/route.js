import { NextResponse } from "next/server";
import { getGovernmentsByCountry } from "@/app/utils/dataFetchers";
import { getFromCache, setInCache } from "@/app/utils/cache";

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode");
    const level = searchParams.get("level");
    const lang = searchParams.get("lang");
    const codes = searchParams.get("codes");
    console.log(`🔎 Busco data para las jurisdicciones de nivel ${level} del país ${countryCode} en el idioma ${lang}`);
    // Verificar si los datos filtrados ya están en caché
    const cacheKey = `governments_${countryCode}_${level}_${lang}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log("🥳 Uso cache", cacheKey);
      return NextResponse.json({ data: cachedData,cached:true });
    }
    console.log("😒 No uso cache ", cacheKey);
    const data = await getGovernmentsByCountry(lang, codes, countryCode, level);   

    return NextResponse.json({ data: data ,cached:false});
  } catch (error) {
    console.error("Error fetching government data:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}

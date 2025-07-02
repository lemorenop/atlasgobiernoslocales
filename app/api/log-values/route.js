import { NextResponse } from "next/server";
import { fetchData } from "@/app/utils/dataFetchers";
import { getFromCache, setInCache } from "@/app/utils/cache";

export async function GET(request, { params }) {
  try {
  
    console.log(`🔎 Busco valores de logValues`);
    // Verificar si los datos filtrados ya están en caché
    const cacheKey = `logValues_es`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log("uso cache",cacheKey);
      return NextResponse.json({ data: cachedData });
    }
    const data = await fetchData("logValues", "es");

    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Error fetching logValues:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}

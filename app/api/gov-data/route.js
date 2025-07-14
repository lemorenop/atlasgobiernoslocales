import { NextResponse } from "next/server";
import { getJurisdictionData } from "@/app/utils/dataFetchers";
import { getFromCache, setInCache } from "@/app/utils/cache";

export async function GET(request, { params }) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    console.log(`🔎 Busco data de la jurisdicción ${slug}`);
    // Verificar si los datos filtrados ya están en caché
    // const cacheKey = `jurisdictionData_${slug}_es`;
    // const cachedData = getFromCache(cacheKey);
    // if (cachedData) {
    //   console.log("uso cache",cacheKey);
    //   return NextResponse.json({ data: cachedData });
    // }
    const data = await getJurisdictionData(slug);

    return NextResponse.json({ data: data });
  } catch (error) {
    console.error("Error fetching government data:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}

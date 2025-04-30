import { NextResponse } from "next/server";
import { getAllData } from "@/app/utils/dataFetchers";
import { getFromCache, setInCache } from "@/app/utils/cache";

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    // Verificar si los datos filtrados ya están en caché
    const cacheKey = `indicator_${slug}`;
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Obtener el gobierno específico

    // Obtener todos los datos y filtrar por el ID del gobierno
    const allData = await getAllData();

    // Filtrar los datos por el ID del indicador  
    const filteredData = allData.filter((item) => item.indicator_code == slug);
    // Transform array to object with indicator_code as keys
    const dataObject = filteredData.reduce((acc, item) => {
        acc[item.government_id] = item;
        return acc;
    }, {});
    // Preparar la respuesta
    const responseData = {
      data: dataObject,
    };

    // Almacenar en caché (con un TTL más corto para los datos filtrados)
    setInCache(cacheKey, responseData, 30 * 60 * 1000); // 30 minutos

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching indicators data:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}

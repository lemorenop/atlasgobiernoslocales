import { NextResponse } from "next/server";
import { fetchData } from "@/app/utils/dataFetchers";

export async function GET(request, { params }) {
  const { slug } = await params;
  try {
    const data = await fetchData(slug, "es");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching all data:", error);
    return NextResponse.json(
      { error: `Error al obtener todos los datos del país ${slug}` },
      { status: 500 }
    );
  }
}

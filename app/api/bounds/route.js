import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const govID = searchParams.get("govID") || "";
  const nivel = searchParams.get("nivel") || "";

  try {
    const bounds = await import(`@/app/utils/governments/nivel_${nivel}_bounds.json`);
    const response = {
      bounds: bounds[govID],
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error al obtener los límites del gobierno: ${govID}`, error);
    return NextResponse.json(
      { error: `Error al obtener los límites del gobierno: ${govID}` },
      { status: 500 }
    );
  }
}

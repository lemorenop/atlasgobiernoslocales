import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request) {
  try {
    // Obtener el parámetro de idioma de la URL
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "es";
    const responseType = searchParams.get("responseType") || "array";
    // Validar idioma
    const validLangs = ["es", "en", "pt"];
    const language = validLangs.includes(lang) ? lang : "es";

    // Construir la ruta al archivo JSON
    const filePath = path.join(
      process.cwd(),
      "app",
      "utils","governments",
      `governments_${language}.json`
    );

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found for language: ${language}` },
        { status: 404 }
      );
    }

    // Leer el contenido del archivo
    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);
    if (responseType === "array") {
      // Devolver los datos como JSON
      return NextResponse.json(data);
    } else {
      const dataObject = data.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
      // Preparar la respuesta
      const responseData = {
        data: dataObject,
      };
      return NextResponse.json(responseData);
    }
  } catch (error) {
    console.error("Error serving governments data:", error);
    return NextResponse.json(
      { error: "Error serving governments data" },
      { status: 500 }
    );
  }
}

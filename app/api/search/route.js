import { NextResponse } from "next/server";
import getSearchIndexByLocale from "@/app/utils/flexSearch";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "es";
  const query = searchParams.get("query") || "";

  try {
    const searchIndexByLocale = await getSearchIndexByLocale();

    if (query && query !== "" && searchIndexByLocale[lang]) {
      const indexParams = {
        limit: 30,
        enrich: true,
        // index:"name"
      };
      
      const searchResults = await searchIndexByLocale[lang].search(
        query,
        indexParams
      ); 

      // const flatResults = searchResults.result;
        const flatResults = searchResults.flatMap(
          (resultSet) => resultSet.result || []
        );
        console.log(flatResults);
      // Remove duplicates (same document showing up in multiple search fields)
      const uniqueResults = [
        ...new Map(flatResults.map((item) => [item.id, item.doc])).values(),
      ];

      return NextResponse.json(uniqueResults);
    }
  } catch (error) {
    console.error(`Error al buscar ${query} dentro de los gobiernosen el idioma${lang}:`, error);
    return NextResponse.json(
      { error: `Error al buscar ${query} dentro de los gobiernosen el idioma${lang}:` },
      { status: 500 }
    );
  }
}

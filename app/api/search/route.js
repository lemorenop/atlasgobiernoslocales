import { NextResponse } from "next/server";
import getSearchIndexByLocale from "@/app/utils/flexSearch";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "es";
  const query = searchParams.get("query") || "";
  const countryCode = searchParams.get("countryCode") ;
  const nivel = searchParams.get("nivel") || "";

  try {
    const searchIndex = await getSearchIndexByLocale(false, lang);

    if (query && query !== "" && searchIndex) {
      const indexParams = {
        limit: 30,
        enrich: true,
        // index:"name"
      };
      
      const searchResults = await searchIndex.search(
        query,
        indexParams
      ); 
      // const flatResults = searchResults.result;
        const flatResults = searchResults.flatMap(
          (resultSet) => resultSet.result || []
        );
        let filteredResults = flatResults;
      if (countryCode) {
        filteredResults = filteredResults.filter(item => item.doc.countryCode === countryCode);
      }
      if (nivel) {
        filteredResults = filteredResults.filter(item => item.doc.nivel === nivel);
      }

      // Remove duplicates (same document showing up in multiple search fields)
      const uniqueResults = [
        ...new Map(filteredResults.map((item) => [item.id, item.doc])).values(),
      ];
      return NextResponse.json(uniqueResults);
    } else return NextResponse.json([]);
  } catch (error) {
    console.error(`Error al buscar ${query} dentro de los gobiernosen el idioma ${lang}:`, error);
    return NextResponse.json(
      { error: `Error al buscar ${query} dentro de los gobiernosen el idioma${lang}:` },
      { status: 500 }
    );
  }
}

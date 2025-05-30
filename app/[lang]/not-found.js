import { fetchData, } from "@/app/utils/dataFetchers";
import { getTextById } from "@/app/utils/textUtils";

export default async function Custom404({ params = {} }) {
  const lang = params?.lang || 'es'; // Default to 'es' if lang is not provided
  const copy = await fetchData("pageError", lang);  
  return (
    <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-white p-m">
      {" "}
      <h1 className="text-black text-center max-w-[400px] [&_a]:text-navy [&_a]:underline">
        {getTextById(copy, "title_404", lang)}
      </h1>
    </main>
  );
}

export async function generateStaticParams() {
  const locales = [{ lang: "es" }, { lang: "en" }, { lang: "pt" }];

  return locales;
}
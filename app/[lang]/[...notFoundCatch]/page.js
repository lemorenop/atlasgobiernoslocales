import { fetchData } from "@/app/utils/dataFetchers";
import { getTextById } from "@/app/utils/textUtils";

export default async function Custom404({ params }) {
  const { lang } = await params;
  const copy = await fetchData("pageError", lang);    
  return (
    <main className="flex-1 flex flex-col justify-center items-center h-full flex-grow bg-white p-m">
      <h1 className="text-black text-center max-w-[400px] [&_a]:text-navy [&_a]:underline">
        {getTextById(copy, "title_404", lang)}
      </h1>
    </main>
  );
}

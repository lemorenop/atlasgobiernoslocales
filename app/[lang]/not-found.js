import { getPageError } from "@/app/utils/dataFetchers";
import { getTextById } from "@/app/utils/textUtils";

export default async function Custom404({ lang }) {
  const copy = await getPageError();    
  console.log(copy)
  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-white p-m">
      {" "}
      <h1 className="text-black text-center max-w-[400px] [&_a]:text-navy [&_a]:underline">
        {getTextById(copy, "title_404", lang)}
      </h1>
    </main>
  );
}

import { fetchData } from "@/app/utils/dataFetchers";
import { getTextById } from "@/app/utils/textUtils";
export async function getMetadata({ lang ,slug}) {
    const copy = await fetchData("metadataCopy", lang);
    return {
      title:`${getTextById(copy, slug, lang)} | ${getTextById(copy, "title", lang)}`,
      description:getTextById(copy, "description", lang),
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_URL}/${lang}/${slug}`,
      },
    };
  }
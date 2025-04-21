import { getAboutCopy } from "@/app/utils/dataFetchers";
import { getTextById } from "@/app/utils/textUtils";
export default async function About({ params }) {
  const lang = params?.lang || i18n.defaultLocale;
  const aboutCopy = await getAboutCopy();
  // console.log(aboutCopy)
  return (
    <main className="container mx-auto p-8">
        <h1>{getTextById(aboutCopy, "hero_subtitle", lang)}</h1>
    </main>
  );
} 
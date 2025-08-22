import { fetchData } from "@/app/utils/dataFetchers";
import Hero from "./hero";
import { getTextById } from "@/app/utils/textUtils";
import Card from "./card";
import Download from "./download";
import { getMetadata } from "../components/metadata";
import Arrow from "../components/icons/arrow";
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return getMetadata({ lang, slug: "acerca-de" });
  
}

export default async function AcercaDe({ params }) {
  const { lang } = await params;
  const copy = await fetchData("aboutCopy", lang);
  const cards = [
    {
      id: "demography",
      indicators: [1, 2, 3, 4],
      image: false,
    },
    { id: "education", indicators: [5, 7], image: true },
    { id: "employment", indicators: [8, 13, 18, 19], image: true },
    { id: "services", indicators: [10, 11, 12, 17], image: true },
    { id: "ethnicity", indicators: [21], image: true },
    { id: "tics", indicators: ["tics"], image: true },
  ];
    const downloadMethodology = copy.find(
    (item) => item.id === "download_button_methodology"
  ).link;
  return (
    <main className="text-black">
      <Hero lang={lang} copy={copy} />
      <div className="bg-background gap-[48px] md:gap-[80px] p-l md:p-[80px] grid lg:grid-cols-2 max-md:pb-[48px]">
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-col gap-m">
            <h2 className="text-h2 font-bold text-navy">
              {getTextById(copy, "about_data_title", lang)}
            </h2>
            <p className="paragraph-small">
              {getTextById(copy, "about_data_text", lang)}
            </p>{" "}
          </div>{" "}
          <Download lang={lang} copy={copy} />
        </div>
        <div className="flex flex-col gap-m">
          <h2 className="text-h2 font-bold text-navy">
            {getTextById(copy, "about_indicators_title", lang)}
          </h2>
          <p className="paragraph-small">
            {getTextById(copy, "about_indicators_text", lang)}
          </p>
           <a
        target="_blank"
        href={downloadMethodology}
        className="w-full md:max-w-96 py-s font-bold justify-between gap-s bg-white border-1 border-black px-3 text-blue-CAF hover:bg-blue-CAF hover:text-white group transition-all flex items-center description cursor-pointer uppercase"
      >
        {getTextById(copy, "download_button_methodology", lang)}{" "}
        <Arrow className="w-4 h-5 stroke-blue-CAF stroke-2 group-hover:stroke-white transition-all border-b-2 border-b-blue-CAF pb-[1px] group-hover:border-b-white" />
      </a>
        </div>
      </div>
      <div className="bg-white p-l md:p-[80px]">
        {cards.map((elm) => (
          <div key={elm.id} className="flex flex-col gap-[32px] py-[32px]">
            <h3 className="text-h2 font-bold text-navy">
              {getTextById(copy, elm.id, lang)}
            </h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-[32px]">
              {elm.indicators.map((ind) => (
                <Card
                  key={ind}
                  indicator={ind}
                  lang={lang}
                  copy={copy}
                  image={elm.image}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import { fetchData } from "@/app/utils/dataFetchers";
import { getTextById } from "@/app/utils/textUtils";
import SearchBox from "./components/searchBox";
import Hero from "./hero";
import SelectLink from "./components/selectLink";

export async function generateStaticParams() {
  const locales = [{ lang: "es" }, { lang: "en" }, { lang: "pt" }];

  return locales;
}

export default async function Home({ params }) {
  const { lang } = await params;
  const [homeCopyData, indicators, homeMapTooltip] = await Promise.all([
    fetchData("homeCopy", lang),
    fetchData("indicators", lang),
    fetchData("homeMapTooltip", lang),
  ]);
  return (
    homeCopyData &&
    indicators && (
      <main className="flex flex-col justify-start text-black bg-white">
        <Hero
          hero_title={getTextById(homeCopyData, "hero_title", lang)}
          hero_subtitle={getTextById(homeCopyData, "hero_subtitle", lang)}
          hero_explore={getTextById(homeCopyData, "hero_explore", lang)}
          lang={lang}
          homeMapTooltip={homeMapTooltip}
        />{" "}
        <div className="flex flex-col px-l md:px-4xl md:grid md:grid-cols-2 gap-[24px] md:gap-[64px] py-2xl md:py-[112px] bg-white relative">
          <div className="bg-background p-xl flex flex-col gap-[24px] justify-between">
            <div className="md:hidden absolute bottom-[-40px] left-[-100px] bg-navy rounded-full w-[200px] h-[200px] z-0" />{" "}
            <div className="flex flex-col gap-[24px]">
              <h2 className="text-h3 font-bold text-navy">
                {getTextById(homeCopyData, "explore_indicator_title", lang)}
              </h2>
              <p className="text-description ">
                {getTextById(homeCopyData, "explore_indicator_subtitle", lang)}
              </p>
            </div>
            {indicators && (
              <SelectLink
                path={"indicadores"}
                lang={lang}
                options={indicators.filter((i) => i.slug)}
                label={getTextById(homeCopyData, "select", lang)}
              />
            )}
          </div>
          <div className="relative z-10">
            <SearchBox
              path={"jurisdicciones"}
              title={getTextById(
                homeCopyData,
                "explore_jurisdiction_title",
                lang
              )}
              subtitle={getTextById(
                homeCopyData,
                "explore_jurisdiction_subtitle",
                lang
              )}
              lang={lang}
              intro={""}
              label={getTextById(
                homeCopyData,
                "explore_jurisdiction_button",
                lang
              )}
            />
          </div>
        </div>{" "}
      </main>
    )
  );
}
export const revalidate = 10; // Revalidar cada 10 minutos

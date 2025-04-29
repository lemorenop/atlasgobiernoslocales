import LanguageSwitcher from "./language-switcher";
import { getTextById } from "@/app/utils/textUtils";
import { fetchApi } from "@/app/utils/apiClient";
import Image from "next/image";
import Link from "next/link";
import NavbarDialogs from "./navbarDialogs";
import SearchBox from "./searchBox";
import { getHomeCopy, getIndicators } from "@/app/utils/dataFetchers";
import SelectLink from "./selectLink";
export default async function Navbar({ lang }) {
  const navbarCopy = await fetchApi("navbar-copy");
  const homeCopyData = await getHomeCopy();
  const indicators = await getIndicators();
  const defaulIndicator =
    lang === "es" ? "poblacion" : lang === "en" ? "population" : "populacao";
  return (
    navbarCopy && (
      <nav className="bg-white text-black py-s px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full">
          <Link href={`/${lang}`} className="">
            <Image
              src={`/logo_${lang}.png`}
              alt="CAF Network Visualizer"
              width={240}
              height={40}
              className="object-contain"
            />
          </Link>
          <div className="hidden md:block">
            <div className=" flex items-center gap-m">
             
              <NavbarDialogs
                lang={lang}
                path={getTextById(navbarCopy, "indicators", lang)}
                button={
                  <div
                    className={`flex items center gap-xs  description cursor-pointer`}
                  >
                    {" "}
                    <Image
                      src="/ind.png"
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain "
                    />
                    {getTextById(navbarCopy, "indicators", lang)}
                  </div>
                }
              >

            <div className="bg-background p-xl flex flex-col gap-[24px] justify-between">
              <div className="flex flex-col gap-[24px]">
                <h2 className="text-h3 font-bold text-navy">
                  {getTextById(homeCopyData, "explore_indicator_title", lang)}
                </h2>
                <p className="text-description text-black">
                  {getTextById(
                    homeCopyData,
                    "explore_indicator_subtitle",
                    lang
                  )}
                </p>
              </div>
            { indicators &&   <SelectLink
                highlightedIfHere={true}
                title={""}
                path={
                  lang === "es"
                    ? "indicadores"
                    : lang === "en"
                    ? "indicators"
                    : "indicadores"
                }
                lang={lang}
                options={indicators}
                label={getTextById(homeCopyData, "select", lang)}
              />}
            </div>
              </NavbarDialogs>
              <NavbarDialogs
                lang={lang}
                path={getTextById(navbarCopy, "jurisdictions", lang)}
                button={
                  <div
                    className={`flex items center gap-xs  description cursor-pointer`}
                  >
                    {" "}
                    <Image
                      src="/jur.png"
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain "
                    />
                    {getTextById(navbarCopy, "jurisdictions", lang)}
                  </div>
                }
              >              
                <SearchBox
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
                  path={ lang === "es"
                    ? "jurisdicciones"
                    : lang === "en"
                    ? "jurisdictions"
                    : "jurisdicoes"}
                  label={getTextById(
                    homeCopyData,
                    "explore_jurisdiction_button",
                    lang
                  )}
                  lang={lang}
                  intro={getTextById(
                    homeCopyData,
                    "explore_jurisdiction_input",
                    lang
                  )}
                />
                {/* </div> */}
              </NavbarDialogs>
              {/* <Link
                href={`/${lang}/${getTextById(navbarCopy, "about_slug", lang)}`}
                className="flex items center gap-xs  description"
              >
                <Image
                  src="/about.png"
                  alt="about"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                {getTextById(navbarCopy, "about", lang)}
              </Link> */}
              <LanguageSwitcher lang={lang} slugs={navbarCopy} />{" "}
            </div>
          </div>{" "}
        </div>
      </nav>
    )
  );
}

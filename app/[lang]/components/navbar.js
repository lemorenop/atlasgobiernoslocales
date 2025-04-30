import LanguageSwitcher from "./language-switcher";
import { getTextById } from "@/app/utils/textUtils";
import { fetchApi } from "@/app/utils/apiClient";
import Image from "next/image";
import Link from "next/link";
import NavbarDialogs from "./navbarDialogs";
import SearchBox from "./searchBox";
import { getHomeCopy, getIndicators } from "@/app/utils/dataFetchers";

export default async function Navbar({ lang }) {
  const navbarCopy = await fetchApi("navbar-copy");
  const homeCopyData = await getHomeCopy();
  const indicators = await getIndicators();

  const densidad = {es: "densidad-poblacional", en: "population-density", pt: "densidade-populacional"}

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
                  <Link
                    className={`flex items center gap-xs  description cursor-pointer`}
                    href={`/${lang}/${getTextById(navbarCopy, "indicators", lang).toLowerCase()}/${densidad[lang]}`}
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
                  </Link>            
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
              <LanguageSwitcher lang={lang} slugs={navbarCopy} indicators={indicators} />{" "}
            </div>
          </div>{" "}
        </div>
      </nav>
    )
  );
}

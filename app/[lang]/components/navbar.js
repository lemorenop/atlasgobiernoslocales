import LanguageSwitcher from "./language-switcher";
import { getTextById } from "@/app/utils/textUtils";
import Image from "next/image";
import Link from "next/link";
import NavbarDialogs from "./navbarDialogs";
import SearchBox from "./searchBox";
import {
  getHomeCopy,
  getIndicators,
  getNavbarCopy,
} from "@/app/utils/dataFetchers";
import NavbarLink from "./navbarLink";

export default async function Navbar({ lang }) {
  const [navbarCopy, homeCopyData, indicators] = await Promise.all([
    getNavbarCopy(lang),
    getHomeCopy(lang),
    getIndicators(lang),
  ]);
  const defaultIndicator = indicators.find((indicator) => indicator.code === 10);

  return (
    navbarCopy &&
    homeCopyData &&
    indicators && (
      <nav className="bg-white text-black py-s px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full">
          <a href={`/${lang}`} className="">
            <Image
              src={`/logo_${lang}.png`}
              alt="CAF Network Visualizer"
              width={240}
              height={40}
              className="object-contain"
            />
          </a>
          <div className="hidden md:block">
            <div className=" flex items-center gap-m">
              <NavbarLink path="home">
                <a
                  href={`/${lang}`}
                  className={`flex items center gap-xs  description cursor-pointer`}
                >
                  {" "}
                  <Image
                    src="/home.png"
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain "
                  />
                  {getTextById(navbarCopy, "home", lang)}
                </a>
              </NavbarLink>
              <NavbarLink path="indicadores">
              <a
                href={`/${lang}/indicadores/${defaultIndicator.slug}`}
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
              </a>
              </NavbarLink>
              <NavbarDialogs
                lang={lang}
                path={"jurisdicciones"}
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
                  path={"jurisdicciones"}
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
              <LanguageSwitcher
                lang={lang}
                slugs={navbarCopy}
                // indicators={indicators}
              />{" "}
            </div>
          </div>{" "}
        </div>
      </nav>
    )
  );
}

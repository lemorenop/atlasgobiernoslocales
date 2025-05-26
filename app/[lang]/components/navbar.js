import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import LanguageSwitcher from "./language-switcher";
import { getTextById } from "@/app/utils/textUtils";
import Image from "next/image";
import NavbarDialogs from "./navbarDialogs";
import SearchBox from "./searchBox";
import { fetchData } from "@/app/utils/dataFetchers";
import NavbarLink from "./navbarLink";

export default async function Navbar({ lang }) {
  const [navbarCopy, homeCopyData] = await Promise.all([
    fetchData("navbarCopy", lang),
    fetchData("homeCopy", lang),
  ]);

  const menuItems = [
    () => (
      <NavbarLink path="home" key="home">
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
    ),
    () => (
      <NavbarLink path="indicadores" key="indicadores">
        <a
          href={`/${lang}/indicadores/acceso-a-fuente-de-agua-mejorada`}
          className={`flex  items center gap-xs  description cursor-pointer`}
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
    ),
    () => (
      <NavbarDialogs
        key="jurisdictions"
        highlightIfActive={true}
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
          title={getTextById(homeCopyData, "explore_jurisdiction_title", lang)}
          subtitle={getTextById(
            homeCopyData,
            "explore_jurisdiction_subtitle",
            lang
          )}
          path={"jurisdicciones"}
          label={getTextById(homeCopyData, "explore_jurisdiction_button", lang)}
          lang={lang}
        />
        {/* </div> */}
      </NavbarDialogs>
    ),
    () => (
      <NavbarLink path="acerca-de" key="acerca-de">
        <a
          href={`/${lang}/acerca-de`}
          className={`flex  items center gap-xs  description cursor-pointer`}
        >
          {" "}
          <Image
            src="/about.png"
            alt=""
            width={24}
            height={24}
            className="object-contain "
          />
          {getTextById(navbarCopy, "about", lang)}
        </a>
      </NavbarLink>
    ),
    () => (
      <LanguageSwitcher
        key="language-switcher"
        lang={lang}
        slugs={navbarCopy}
      />
    ),

  ];
  return (
    navbarCopy &&
    homeCopyData && (
      <nav className="bg-white text-black py-s px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full">
          <a href={`https://www.caf.com/`} className="" target="_blank">
            <Image
              src={`/logo_${lang}.png`}
              alt="CAF Network Visualizer"
              width={240}
              height={40}
              className="object-contain"
            />
          </a>
          <div className="lg:hidden">
            <Menu>
        
              <MenuButton
                aria-label="Menu"
                className="flex flex-col gap-xs justify-center items-center cursor-pointer"
              >
                <div className="w-6 h-1 bg-navy" />
                <div className="w-8 h-1 bg-navy" />
                <div className="w-6 h-1 bg-navy" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className="w-full bg-white origin-top-right bog-white p-l  text-black transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0 flex flex-col gap-m"
              >
                {menuItems.map((item, i) => (
                  <MenuItem key={i}>{item()}</MenuItem>
                ))}
              </MenuItems>
            
            </Menu>
          </div>
          <div className="hidden lg:block">
            <div className=" flex items-center gap-m">
              {menuItems.map((item) => item())}{" "}
            </div>
          </div>{" "}
        </div>
      </nav>
    )
  );
}

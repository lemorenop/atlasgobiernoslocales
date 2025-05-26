import Image from "next/image";
import Facebook from "./icons/facebook";
import Instagram from "./icons/instagram";
import LinkedIn from "./icons/linkedin";
import X from "./icons/x";
import Youtube from "./icons/youtube";
import { getTextById } from "@/app/utils/textUtils";
import NavbarDialogs from "./navbarDialogs";
import SearchBox from "./searchBox";
import { fetchData } from "@/app/utils/dataFetchers";
import FooterDownload from "./footerDownload";

const socialMedia = {
  instagram: () => <Instagram className="w-6 h-6 fill-blue-CAF" />,
  x: () => <X className="w-6 h-6 fill-blue-CAF" />,
  facebook: () => <Facebook className="w-6 h-6 fill-blue-CAF" />,
  linkedin: () => <LinkedIn className="w-6 h-6 fill-blue-CAF" />,
  youtube: () => <Youtube className="w-6 h-auto fill-blue-CAF" />,
};

export default async function Footer({ lang }) {
  const [footerCopy, navbarCopy, homeCopyData] = await Promise.all([
    fetchData("footerCopy", lang),
    fetchData("navbarCopy", lang),
    fetchData("homeCopy", lang),
  ]);

  function findLink(id, lang) {
    return footerCopy.find((elm) => elm.id === id)?.[
      lang ? `link_${lang}` : `link`
    ];
  }

  const year = new Date().getFullYear();

  return (
    footerCopy && (
      <>
        <div className="bg-blue-CAF px-l md:px-[80px] flex flex-col md:grid md:grid-cols-12 gap-[32px]md:gap-[64px] text-white relative md:items-center">
          <Image
            src="/red-logo.png"
            alt="Reporte de Economía y Desarrollo"
            width={180}
            height={49}
            className=" object-contain z-10  py-[48px] col-span-2"
          />
          <p className="text-white z-10 md:py-[48px] col-span-4">
            {getTextById(footerCopy, "credits", lang)}
          </p>
          <div className="py-[32px] md:py-[48px] relative col-span-5 col-start-8 h-full">
            <div className="absolute top-0 right-0 z-0 h-full flex w-full gap-xl justify-end">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 116 232"
                fill="none"
                className="h-full"
                alt=""
              >
                <path
                  d="M116 232C85.2349 232 55.7298 219.779 33.9756 198.024C12.2214 176.27 0 146.765 0 116C-7.62939e-06 85.2349 12.2214 55.7299 33.9756 33.9756C55.7298 12.2214 85.2349 5.99019e-06 116 0L116 232Z"
                  fill="#428DBA"
                />
              </svg>
              <div
                className="franjas-diagonales-small aspect-square w-fit"
                style={{
                  width: "fit-content",
                }}
              />
            </div>

            <p className="p-[24px] bg-navy z-10 relative my-auto specific-underline-style">
              {getTextById(footerCopy, "highlighted_message_1", lang)}
            </p>
          </div>
        </div>
        <footer className="bg-background text-black px-l md:px-[80px]">
        
            <div className="pb-[32px] flex flex-col md:flex-row  gap-[32px] md:gap-[80px] pt-[40px] justify-between max-md:flex-wrap">
              <div className="w-full flex flex-col gap-s  max-md:gap-[32px]">
                <Image
                  src={`/logo_${lang}.png`}
                  alt="CAF Network Visualizer"
                  width={240}
                  height={40}
                />
                <a
                  href={`mailto:${findLink("email")}`}
                  target="_blank"
                  className="description underline"
                >
                  {findLink("email")}
                </a>
                <ul className="flex gap-s items-end max-sm:w-full max-sm:justify-between">
                  {["instagram", "x", "facebook", "linkedin", "youtube"].map(
                    (elm) => {
                      const link = findLink(elm);
                      if (link)
                        return (
                          <li key={elm}>
                            <a
                              alt={elm}
                              href={link}
                              target="_blank"
                              className="description"
                            >
                              {socialMedia[elm]()}
                            </a>
                          </li>
                        );
                    }
                  )}
                </ul>
              </div>
              <div className="w-fit max-md:w-full">
                <FooterDownload lang={lang} copy={footerCopy} />
              </div>

              <div className="grid grid-cols-2  gap-2xl min-w-fit">
                <div className="flex flex-col gap-s max-md:gap-m min-w-fit">
                  <a
                    href={findLink("caf_button", lang)}
                    className="text-paragraph-small underline"
                    target="_blank"
                  >
                    {getTextById(footerCopy, "caf_button", lang)}
                  </a>
                  <a
                    href={findLink("red_button", lang)}
                    className="text-paragraph-small underline"
                    target="_blank"
                  >
                    {getTextById(footerCopy, "red_button", lang)}
                  </a>
                </div>
                <div className="flex flex-col gap-s max-md:gap-m">
                  <NavbarDialogs
                    button={
                      <div
                        className={`flex items center gap-xs underline paragraph-small cursor-pointer`}
                      >
                        {getTextById(navbarCopy, "jurisdictions", lang)}
                      </div>
                    }
                  >
                    <SearchBox
                      path={"jurisdicciones"}
                      subtitle={getTextById(
                        homeCopyData,
                        "explore_jurisdiction_subtitle",
                        lang
                      )}
                      title={getTextById(
                        homeCopyData,
                        "explore_jurisdiction_title",
                        lang
                      )}
                      lang={lang}
                      label={getTextById(
                        homeCopyData,
                        "explore_jurisdiction_input",
                        lang
                      )}
                    />
                  </NavbarDialogs>
                  <a
                    className={`flex items center gap-xs underline  paragraph-small cursor-pointer`}
                    href={`/${lang}/indicadores/acceso-a-fuente-de-agua-mejorada`}
                  >
                    {getTextById(navbarCopy, "indicators", lang)}
                  </a>
                  <a
                    className={`flex items center gap-xs underline  paragraph-small cursor-pointer`}
                    href={`/${lang}/acerca-de`}
                  >
                    {getTextById(navbarCopy, "about", lang)}
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-s pb-[24px]">
              <span className="description ">
                Copyright {year}. {getTextById(footerCopy, "copyright_1", lang)}
              </span>
            </div>
        
        </footer>
      </>
    )
  );
}

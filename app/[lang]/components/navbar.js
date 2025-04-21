// "use client";

import { getDictionary } from "@/app/i18n.config";
import LanguageSwitcher from "./language-switcher";
import { getTextById } from "@/app/utils/textUtils";
// import { useEffect, useState } from "react";
import { fetchNavbarCopy } from "@/app/utils/apiClient";
import LocalizedLink from "./LocalizedLink";
import Image from "next/image";
export default async function Navbar({ lang }) {
  const navbarCopy = await fetchNavbarCopy();
  // const [navbarCopy, setNavbarCopy] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await fetchNavbarCopy();
  //       setNavbarCopy(data);
  //     } catch (error) {
  //       console.error("Error fetching navbar copy:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    navbarCopy && (
      <nav className="bg-white text-black py-s px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full">
          <LocalizedLink href="/" className="">
            <Image
              src="/logo.png"
              alt="CAF Network Visualizer"
              width={240}
              height={40}
              className="object-contain"
            />
          </LocalizedLink>
          <div className="hidden md:block">
            <div className=" flex items-center gap-m">
              <LocalizedLink
                href="/indicators"
                className="flex items center gap-xs  description"
              >
                <Image
                  src="/ind.png"
                  alt="about"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                {getTextById(navbarCopy, "indicators", lang)}
              </LocalizedLink>
              <LocalizedLink
                href="/jurisdictions"
                className={`flex items center gap-xs  description before:content-['${getTextById(
                  navbarCopy,
                  "jurisdictions",
                  lang
                )}']`}
              >
                {" "}
                <Image
                  src="/jur.png"
                  alt="about"
                  width={24}
                  height={24}
                  className="object-contain "
                />
                {getTextById(navbarCopy, "jurisdictions", lang)}
              </LocalizedLink>
              <LocalizedLink
                href="/about"
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
              </LocalizedLink>
              <LanguageSwitcher lang={lang} />{" "}
            </div>
          </div>{" "}
        </div>
      </nav>
    )
  );
}

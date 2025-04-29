"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18n } from "@/app/i18n.config";

export default function LanguageSwitcher({ lang, slugs, indicators }) {
  const pathname = usePathname();
  const currentSlug = pathname.split(`/${lang}`).filter((elm) => elm !== "");
  let slug = null;
  let secondSlug = { es: "", en: "", pt: "" };
  if (currentSlug.length > 0) {
    const currentSlugArray = currentSlug[0].split(`/`);
    const firstSlug = currentSlugArray[1];
    secondSlug = {
      es: currentSlugArray[2],
      en: currentSlugArray[2],
      pt: currentSlugArray[2],
    };

    const slugID = slugs.find((elm) => elm[`text_${lang}`] === firstSlug)?.id;
    slug = slugs.find((elm) => elm.id === slugID);
    if (slugID === "indicators_slug") {
      console.log("**",secondSlug)
      const indicator = indicators.find(
        (elm) => elm[`slug_${lang}`] === secondSlug[lang]
      );
      console.log("*",indicator)
      if (indicator)
        secondSlug = {
          es: indicator.slug_es,
          en: indicator.slug_en,
          pt: indicator.slug_pt,
        };
    }
  }
  return (
    <div className="flex items-center space-x-2">
      {i18n.locales.map((locale) => (
        <a
          key={locale}
          href={`/${locale}/${
            slug ? `${slug[`text_${locale}`]}/${secondSlug[locale]}` : ""
          }`}
          locale={"false"} // Importante para evitar que Next.js añada el prefijo automáticamente
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            lang === locale
              ? "bg-blue-CAF text-white"
              : "text-black hover:bg-blue-CAF hover:text-white"
          }`}
        >
          {locale.toUpperCase()}
        </a>
      ))}
    </div>
  );
}

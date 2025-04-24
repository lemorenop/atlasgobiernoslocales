"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18n } from "@/app/i18n.config";

export default function LanguageSwitcher({ lang, slugs }) {
  const pathname = usePathname();
  const currentSlug = pathname.split(`/${lang}`).filter(elm=>elm!=='');
  let slug = null;
  let secondSlug = "";
  if (currentSlug.length > 0) {
    const currentSlugArray = currentSlug[0].split(`/`)
    const firstSlug = currentSlugArray[1];
    secondSlug = currentSlugArray[2];

    const slugID = slugs.find((elm) => elm[`text_${lang}`] === firstSlug).id;
    slug = slugs.find((elm) => elm.id === slugID);
  }
  return (
    <div className="flex items-center space-x-2">
      {i18n.locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}/${
            slug ? `${slug[`text_${locale}`]}/${secondSlug}` : ""
          }`}
          locale={"false"} // Importante para evitar que Next.js añada el prefijo automáticamente
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            lang === locale
              ? "bg-blue-CAF text-white"
              : "text-black hover:bg-blue-CAF hover:text-white"
          }`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}

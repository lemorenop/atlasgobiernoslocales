"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18n } from "@/app/i18n.config";
import { getLocalizedPath } from "@/app/utils/navigation";

export default function LanguageSwitcher({ lang }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-2">
      {i18n.locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalizedPath(pathname, lang, locale)}
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

import { fetchData } from "@/app/utils/dataFetchers";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const languages = ["en", "es", "pt"];
  
  // Obtener todos los indicadores
  const indicators = await fetchData("indicators", "es").filter(
    (elm) => elm.slug
  );

  // Generar URLs para todos los indicadores en todos los idiomas
  const sitemapEntries = [];

  indicators.forEach((indicator) => {
    languages.forEach((language) => {
      const alternates = {};
      languages.forEach((lang) => {
        if (lang !== language) {
          alternates[lang] = `${baseUrl}/${lang}/indicadores/${indicator.slug}`;
        }
      });

      sitemapEntries.push({
        url: `${baseUrl}/${language}/indicadores/${indicator.slug}`,
        lastModified: new Date(),
        alternates: {
          languages: {
            ...alternates,
            "x-default": `${baseUrl}/en/indicadores/${indicator.slug}`,
          },
        },
      });
    });
  });

  return sitemapEntries;
}

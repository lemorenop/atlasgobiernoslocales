import governments from "@/app/utils/governments/governments_en.json";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const languages = ["en", "es", "pt"];

  // Generar URLs para todas las jurisdicciones en todos los idiomas
  const sitemapEntries = [];
  
  governments.forEach((jurisdiction) => {
    languages.forEach((language) => {
      const alternates = {};
      languages.forEach((lang) => {
        if (lang !== language) {
          alternates[lang] = `${baseUrl}/${lang}/jurisdicciones/${jurisdiction.id}`;
        }
      });

      sitemapEntries.push({
        url: `${baseUrl}/${language}/jurisdicciones/${jurisdiction.id}`,
        lastModified: new Date(),
        alternates: {
          languages: {
            ...alternates,
            "x-default": `${baseUrl}/en/jurisdicciones/${jurisdiction.id}`,
          },
        },
      });
    });
  });

  return sitemapEntries;
}

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const languages = ["en", "es", "pt"];

  // Páginas estáticas que necesitan sitemap
  const staticPages = [
    "", // home page
    "acerca-de",
    "politica-de-privacidad"
  ];

  const sitemapEntries = [];

  // Generar URLs para cada página estática en todos los idiomas
  staticPages.forEach((page) => {
    languages.forEach((language) => {
      const alternates = {};
      languages.forEach((lang) => {
        if (lang !== language) {
          alternates[lang] = `${baseUrl}/${lang}${page ? `/${page}` : ""}`;
        }
      });

      sitemapEntries.push({
        url: `${baseUrl}/${language}${page ? `/${page}` : ""}`,
        lastModified: new Date(),
        alternates: {
          languages: {
            ...alternates,
            "x-default": `${baseUrl}/en${page ? `/${page}` : ""}`,
          },
        },
      });
    });
  });

  return sitemapEntries;
}

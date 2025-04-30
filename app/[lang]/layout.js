import "@/app/globals.css";
import Footer from "@/app/[lang]/components/footer";
import Navbar from "@/app/[lang]/components/navbar";
import { i18n } from "@/app/i18n.config";
import "@/app/globals.css";
import { Raleway } from "next/font/google";
import GovernmentDataProvider from "./components/governmentDataProvider";
import GAnalytics from "./components/analytics";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "700"], // puedes ajustar los pesos según lo que necesites
  variable: "--font-raleway", // opcional, si quieres usarlo como una variable CSS
});

export const metadata = {
  title: "CAF | Atlas de gobiernos locales y regionales de América Latina y el Caribe",
  description: "Explore, compare y descargue indicadores clave sobre el desarrollo en más de 18.000 jurisdicciones locales y regionales de América Latina y el Caribe. Una herramienta abierta y transparente para la toma de decisiones.",
  image: "/share.png",
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body
        className={`${raleway.className} antialiased min-h-screen flex flex-col justify-between bg-white font-normal font-[Raleway]`}
      >
      <GAnalytics/>
      <GovernmentDataProvider lang={lang}>
          <Navbar lang={lang} />
          <div className="flex-grow">{children}</div>
          <Footer lang={lang} />
        </GovernmentDataProvider>
      </body>
    </html>
  );
}

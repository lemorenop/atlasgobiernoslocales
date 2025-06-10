import Es from "./es";
import Pt from "./pt";
import En from "./en";
import { getMetadata } from "../components/metadata";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return getMetadata({ lang, slug: "politica-de-privacidad" });
  
}
export default async function Page({params}) {
    const {lang} = await params;
    if(lang === 'es') {
        return <Es />
    }
    if(lang === 'pt') {
        return <Pt />
    }
    if(lang === 'en') {
        return <En />
    }
    return (
        <div>
            <h1>Política de Privacidad</h1>
        </div>
    )
}


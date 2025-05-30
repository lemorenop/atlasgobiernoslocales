import Es from "./es";
import Pt from "./pt";
import En from "./en";
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


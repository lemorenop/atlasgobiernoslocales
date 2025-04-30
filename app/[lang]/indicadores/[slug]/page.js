import Indicator from "../../_singleIndicator/page";
import { getIndicators } from "@/app/utils/dataFetchers";

export async function generateStaticParams() {
  const slugs = (await getIndicators("es")).filter(elm=>elm.slug)
const locales=["es","en","pt"]
const params = [];

for (const lang of locales) {
  for (const slug of slugs) {
    params.push({ lang, slug: slug.slug });
  }
}
  return params
}


export default async function Page({params}) {
  const {lang,slug} = await params;
  
  return  <Indicator lang={lang} slug={slug} />;
  

  
}
export const dynamicParams = false
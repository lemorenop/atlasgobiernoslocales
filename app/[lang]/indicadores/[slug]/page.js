import Indicator from "../../_singleIndicator/page";

export default async function Page({params}) {
  const {lang,slug} = await params;
  
  return  <Indicator lang={lang} slug={slug} />;
  

  
}

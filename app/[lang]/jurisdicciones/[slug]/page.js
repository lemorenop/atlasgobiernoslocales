import Jurisdiction2 from "../../_singleJurisdiction2/page";

export default async function Page({params}) {
  const {lang,slug} = await params;
  
  return  <Jurisdiction2 lang={lang} slug={slug} />;
  

  
}

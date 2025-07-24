import {
  getGovernments,
  getCountries,
  getYearData,
  getJurisdictionData,
  fetchData,
} from "@/app/utils/dataFetchers";
import Content from "./content";
export default async function CachePage({params}) {
  const {lang}= await params 
  const copy= await fetchData("cacheCopy",lang)
  return <Content lang={lang} copy={copy}/>
 
}

"use client"
import NavbarDialogs from "@/app/[lang]/components/navbarDialogs";
import SearchBox from "@/app/[lang]/components/searchBox";
import { getTextById } from "@/app/utils/textUtils";
import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import { useContext } from "react"; 
export default function StickyBar() {
    const {  jurisdictionsCopy, government, lang } = useContext(
        JurisdictionDataContext
      );
  return (
    <div className="col-span-12 sticky top-0 left-0 w-full bg-background py-s px-l md:px-[48px] z-30 flex gap-m items-center">
      <p className="text-blue-CAF description font-bold">
        {government.name}, {government["description_" + lang]}
      </p>
      <div className="h-4 w-1 border-r-1" />
      <NavbarDialogs
        button={
          <span className="description underline">
            {getTextById(jurisdictionsCopy, "change_jurisdiction", lang)}
          </span>
        }
        highlightIfActive={true}
      >
        <SearchBox
          title={getTextById(
            jurisdictionsCopy,
            "explore_jurisdiction_title",
            lang
          )}
          subtitle={getTextById(
            jurisdictionsCopy,
            "explore_jurisdiction_subtitle",
            lang
          )}
          path={"jurisdicciones"}
          label={getTextById(
            jurisdictionsCopy,
            "explore_jurisdiction_button",
            lang
          )}
          lang={lang}
        />
      </NavbarDialogs>
    </div>
  );
}

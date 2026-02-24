"use client";
import Image from "next/image";
import { getTextById } from "@/app/utils/textUtils";
import { useContext, useState, useEffect } from "react";
import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import MapGoverment from "./mapGoverment";
import Share from "../../components/share";
import { downloadImage } from "@/app/utils/downloadHandlers";
import Arrow from "@/app/[lang]/components/icons/arrow";
import Loader from "@/app/[lang]/components/loader";
export default function Hero({ yearPoblacion }) {
  const {
    indicators,
    jurisdictionsCopy,
    government,
    lang,
    mapRef,
    jurisdictionData,
  } = useContext(JurisdictionDataContext);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (jurisdictionData) {
      setLoading(false);
    }
  }, [jurisdictionData]);
  const data = jurisdictionData;
  const toLocaleString = (value) => {
    console.log("testing value", value)
    console.log("lang", lang)
    const divisor = lang === "es" || lang === "pt" ? "." : ",";

    if (value < 10000 && value >= 1000) {
      const thousands = Math.floor(value / 1000);
      const rest = value % 1000;
      const restPadded = rest.toString().padStart(3, "0");
      return `${thousands}${divisor}${restPadded}`;
    }

    return value.toLocaleString(lang === "es" || lang === "pt" ? "es" : "en");
  };
  const indicatorsHero = [1, 26, 2, 3];
  const pobData = data?.find((item) => item.indicator_code === 1).value;
  return (
    jurisdictionsCopy && (
      <div className="flex flex-col md:grid md:grid-cols-12 bg-navy h-full flex-grow">
        <div className="md:col-span-6 lg:col-span-4 px-l md:pl-xl lg:pl-[80px] text-white flex flex-col justify-between py-xl pr-xl gap-xl">
          {government && (
            <div className="flex flex-col gap-m ">
              <h1 className="text-h1 font-bold uppercase">
                {government.name}
                <br />
                <span className="paragraph-small font-medium">
                  {government["description_" + lang]}
                </span>
              </h1>
            </div>
          )}
          <div
            style={{
              borderColor: "rgba(255, 255, 255, 0.40)",
            }}
            className="grid grid-cols-2 gap-m py-m border-y-1 relative min-h-[280px]"
          >
            {loading ? (
              <div className="max-md:hidden absolute top-0 bottom-0 transform right-0 left-0 m-auto w-fit h-fit">
              <span className="horizontal-loader"></span>
            </div>
            ) : (
              indicators &&
              data &&
              indicatorsHero
                .map((elm) => {
                  const indicator = indicators.find((ind) => elm === ind.code);
                  return indicator;
                })
                .map((ind) => {
                  const value = data?.find(
                    (item) => item.indicator_code === ind.code
                  )?.value;

                  const fullInd = indicators.find(
                    (item) => item.code === ind.code
                  );

                  return (
                    value &&
                    value !== "" && (
                      <div
                        className="flex flex-col gap-s uppercase"
                        key={ind.code}
                      >
                        <Image
                          className="object-contain"
                          src={`/${ind.code}.png`}
                          alt={""}
                          width={20}
                          height={20}
                        />
                        <p className="caption">
                          {ind[`name_${lang}`]}
                          <br />
                          <span className="font-bold description">
                            {toLocaleString(value)}
                            {ind.code !== 1 ? (
                              <sup className="text-[10px]">
                                {fullInd.unit?.unit ? fullInd.unit?.unit : ""}
                              </sup>
                            ) : (
                              <span className="text-[10px]">
                                {" "}
                                {fullInd.unit?.unit}
                              </span>
                            )}
                          </span>
                        </p>
                      </div>
                    )
                  );
                })
            )}{" "}
            <p className="text-right caption uppercase col-span-2">
              {!loading &&
                (yearPoblacion && pobData
                  ? `${getTextById(
                      jurisdictionsCopy,
                      "year_data",
                      lang
                    )}: ${yearPoblacion}`
                  : `${getTextById(jurisdictionsCopy, "no_pop_data", lang)}`)}
            </p>
          </div>
          <Share
            shareText={`${government.name} - ${
              government[`description_${lang}`]
            }`}
            shareTitle={getTextById(jurisdictionsCopy, "share", lang)}
          />

          <button
            id="download-gov"
            onClick={() =>
              downloadImage(
                "main",
                [
                  {
                    type: "map",
                    image: mapRef,
                    container: "map-gov",
                  },
                ],
                "download-gov",
                `${government.name} - ${government[`description_${lang}`]}`,
                lang
              )
            }
            className="w-full md:w-fit  remove-from-capture cursor-pointer  inline-flex items-center gap-s  bg-white text-blue-CAF font-bold  px-3 focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white border-1 hover:border-white  border-black hover:bg-navy hover:text-white transition-all duration-300  justify-between data-[open]:rotate-0 py-s description  group"
          >
            {getTextById(jurisdictionsCopy, "download_gov", lang)}{" "}
            <div id="capture-loader" className="hidden ">
              <Loader className="w-full h-full [&_span]:w-[12px] [&_span]:h-[12px] " />
            </div>
            <Arrow className="w-[12px] h-[12px] stroke-2 stroke-blue-CAF group-hover:stroke-white transition-all duration-300 capture-arrow" />
          </button>
        </div>{" "}
        <div className="md:col-span-6 lg:col-span-8 bg-background max-md:h-[50vh]">
          {government && (
            <MapGoverment
              jurisdictionsCopy={jurisdictionsCopy}
              governmentID={government.id}
              nivel={government.level}
              lang={lang}
            />
          )}
        </div>
      </div>
    )
  );
}

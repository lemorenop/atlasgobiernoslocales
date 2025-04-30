"use client";
import Image from "next/image";
import { getTextById } from "@/app/utils/textUtils";
import { JurisdictionDataContext } from "./jurisdictionDataProvider";
import { useContext } from "react";
import MapGoverment from "./mapGoverment";
import Share from "./share";
export default function Hero({
  indicators,

  lang,
  government,
  jurisdictionsCopy,
  yearPoblacion,data
}) {
  // const { data } = useContext(JurisdictionDataContext);
  const indicatorsHero = [1, 26, 2, 3];
  return (
    jurisdictionsCopy && (
      <div className="grid md:grid-cols-12 bg-navy">
        <div className="col-span-4 pl-[80px] text-white flex flex-col justify-between pt-xl  pb-m pr-xl gap-xl">
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
            className="grid grid-cols-2 gap-m py-m border-y-1"
          >
            {indicators &&
              data &&
              indicatorsHero
                .map((elm) => {
                  const indicator = indicators.find((ind) => elm === ind.code);
                  return indicator;
                })
                .map((ind) => {
                  const value = data.find(
                    (item) => item.indicator_code === ind.code
                  )?.value;

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
                            {Math.round(value)?.toLocaleString(
                              lang === "es" || lang === "pt" ? "es" : "en"
                            )}
                            <sup className="text-[10px]">
                              {ind.unit?.unit}
                            </sup>
                          </span>
                        </p>
                      </div>
                    )
                  );
                })}{" "}
            {yearPoblacion && (
              <p className="text-right caption uppercase col-span-2">
                {getTextById(jurisdictionsCopy, "year_data", lang)}
                {": "}
                {yearPoblacion}
              </p>
            )}
          </div>
          <Share
            lang={lang}
            government={government}
            jurisdictionsCopy={jurisdictionsCopy}
          />
        </div>{" "}
        <div className="col-span-8 bg-background max-md:h-[50vh]">
          {government && (
            <MapGoverment
              governmentID={government.id}
              nivel={government.level_per_country_id.split("_")[0]}
              lang={lang}
            />
          )}
        </div>
      </div>
    )
  );
}

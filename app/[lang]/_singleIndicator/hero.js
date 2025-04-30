"use client";
import { getTextById } from "@/app/utils/textUtils";
import SelectLink from "@/app/[lang]/components/selectLink";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  EmailShareButton,
  EmailIcon,
} from "next-share";
import { useEffect, useState } from "react";
export default function Hero({ lang, slug, copy, indicators, indicator }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : null;
    setUrl(url);
  }, []);
  const shareText = `${indicator[`name_${lang}`]}`;

  return (
    <div className="grid xl:grid-cols-2 gap-xl xl:gap-96  bg-blue-CAF franjas-diagonales px-[80px] py-[112px]">
      <div className="flex flex-col justify-between gap-xl">
        <div className="flex flex-col gap-s">
          <h1 className="text-h3 font-bold text-white">
            {getTextById(copy, "hero_title", lang)}
          </h1>
          <p className="paragraph-small text-white">
            {getTextById(copy, "hero_subtitle", lang)}
          </p>
        </div>
        {url && (
          <div className="flex justify-between gap-s uppercase  items-center flex-wrap border-t border-t-[#FFFFFF66] pt-[24px]">
            <p className="caption text-white">{getTextById(copy, "share", lang)}</p>
            <div className="flex gap-xxs">
              <TwitterShareButton url={url} title={shareText}>
                <TwitterIcon
                  size={40}
                  round
                  bgStyle={{ fill: "transparent" }}
                />
              </TwitterShareButton>{" "}
              <FacebookShareButton url={url} quote={shareText}>
                <FacebookIcon
                  size={40}
                  round
                  bgStyle={{ fill: "transparent" }}
                />
              </FacebookShareButton>
              <LinkedinShareButton url={url}>
                <LinkedinIcon
                  size={40}
                  round
                  bgStyle={{ fill: "transparent" }}
                />
              </LinkedinShareButton>
              <EmailShareButton url={url} subject={shareText} body="body">
                <EmailIcon size={40} round bgStyle={{ fill: "transparent" }} />
              </EmailShareButton>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-s">
        <div className="flex flex-col gap-xs max-w-96">
           <SelectLink
          activeOption={indicator[`name_${lang}`]}
          title={getTextById(copy, "select", lang)}
          path={"indicadores"
          }
          lang={lang}
          options={indicators}
          colorLabel="white"
        />
        </div>
       
        <p className="description text-white">
          {indicator[`description_${lang}`]}
        </p>
      </div>
    </div>
  );
}

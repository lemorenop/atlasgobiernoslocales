"use client";
import { getTextById } from "@/app/utils/textUtils";
import SelectLink from "../../components/selectLink";
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
    <div className="grid grid-cols-2 gap-96  bg-blue-CAF franjas-diagonales px-[80px] py-[112px]">
      <div className="flex flex-col justify-between gap-m">
        <div className="flex flex-col gap-s">
          <h1 className="text-h2 font-bold text-white">
            {getTextById(copy, "hero_title", lang)}
          </h1>
          <p className="text-h4 text-white">
            {getTextById(copy, "hero_subtitle", lang)}
          </p>
        </div>
        {url && (
          <div className="flex justify-between gap-s uppercase  items-center flex-wrap">
            <p className="caption">{getTextById(copy, "share", lang)}</p>
            <div className="flex gap-s">
              <FacebookShareButton url={url} quote={shareText}>
                <FacebookIcon
                  size={32}
                  round
                  bgStyle={{ fill: "transparent" }}
                />
              </FacebookShareButton>
              <TwitterShareButton url={url} title={shareText}>
                <TwitterIcon
                  size={32}
                  round
                  bgStyle={{ fill: "transparent" }}
                />
              </TwitterShareButton>
              <LinkedinShareButton url={url}>
                <LinkedinIcon
                  size={32}
                  round
                  bgStyle={{ fill: "transparent" }}
                />
              </LinkedinShareButton>
              <EmailShareButton url={url} subject={shareText} body="body">
                <EmailIcon size={32} round bgStyle={{ fill: "transparent" }} />
              </EmailShareButton>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-s">
        <SelectLink
          activeOption={indicator[`name_${lang}`]}
          title={getTextById(copy, "select", lang)}
          path={
            lang === "es"
              ? "/indicadores"
              : lang === "en"
              ? "/indicators"
              : "/indicadores"
          }
          lang={lang}
          options={indicators}
        />
        <p className="text-description text-white">
          {indicator[`description_${lang}`]}
        </p>
      </div>
    </div>
  );
}

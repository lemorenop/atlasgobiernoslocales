"use client";
import { getTextById } from "@/app/utils/textUtils";
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
import { useState, useEffect } from "react";
export default function Share({ lang, government, jurisdictionsCopy }) {
  const [url, setUrl] = useState(null);
  const [shareText, setShareText] = useState(null);
  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : null;
    const shareText = `${government.name} - ${
      government[`description_${lang}`]
    }`;
    setUrl(url);
    setShareText(shareText);
  }, [government, lang]);
  return (
    url && (
      <div className="flex justify-between gap-s uppercase  items-center flex-wrap ">
        <p className="caption">
          {getTextById(jurisdictionsCopy, "share", lang)}
        </p>
        <div className="flex gap-xs items-center">
          <TwitterShareButton url={url} title={shareText}>
            <TwitterIcon size={36} round bgStyle={{ fill: "transparent" }} />
          </TwitterShareButton>{" "}
          <FacebookShareButton url={url} quote={shareText}>
            <FacebookIcon size={36} round bgStyle={{ fill: "transparent" }} />
          </FacebookShareButton>
          <LinkedinShareButton url={url}>
            <LinkedinIcon size={36} round bgStyle={{ fill: "transparent" }} />
          </LinkedinShareButton>
          <EmailShareButton url={url} subject={shareText} body="body">
            <EmailIcon size={36} round bgStyle={{ fill: "#004A80" }} />
          </EmailShareButton>
        </div>
      </div>
    )
  );
}

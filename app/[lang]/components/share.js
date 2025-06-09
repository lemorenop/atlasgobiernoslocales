"use client";
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
export default function Share({ color = "#fff", shareText, shareTitle }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.href : null;

    setUrl(url);
  }, []);
  return (
    url && (
      <div className="flex justify-between gap-s uppercase  items-center flex-wrap ">
        <p className="caption">{shareTitle}</p>
        <div className="flex gap-xs items-center">
          <TwitterShareButton url={url} title={shareText}>
            <div className="md:w-12 w-8">
              <TwitterIcon
                iconFillColor={color}
                size={"100%"}
                round
                bgStyle={{ fill: "transparent" }}
              />
            </div>
          </TwitterShareButton>{" "}
          <FacebookShareButton url={url} quote={shareText}>
            <FacebookIcon
              iconFillColor={color}
              size={36}
              round
              bgStyle={{ fill: "transparent" }}
            />
          </FacebookShareButton>
          <LinkedinShareButton url={url}>
            <LinkedinIcon
              iconFillColor={color}
              size={36}
              round
              bgStyle={{ fill: "transparent" }}
            />
          </LinkedinShareButton>
          <EmailShareButton url={url} subject={shareText} body="body">
            <EmailIcon
              iconFillColor={color}
              size={36}
              round
              bgStyle={{ fill: color === "#fff" ? "#004A80" : "#fff" }}
            />
          </EmailShareButton>
        </div>
      </div>
    )
  );
}

import Image from "next/image";
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
import MapGoverment from "./mapGoverment";
export default function Hero({
  indicators,
  data,
  lang,
  government,
  jurisdictionsCopy,
}) {
  const indicatorsHero = ["1", "2", "3"];
  const url = typeof window !== "undefined" ? window.location.href : null;
const shareText=`${government.name} - ${government[`description_${lang}`]}`
  return (
    <div className="grid grid-cols-12 bg-blue-CAF">
      <div className="col-span-4 pl-[80px] text-white flex flex-col justify-between pt-xl  pb-m pr-xl gap-xl">
        <div className="flex flex-col gap-m ">
          <h1 className="text-h1 font-bold">{government.name}
            <br/>
            <span className="paragraph-small font-medium">
            {government[`description_${lang}`]}</span>

          </h1>
         
        </div>
        <div className="grid grid-cols-2 gap-m">
          {indicators
            .filter((ind) => indicatorsHero.includes(ind.code))
            .map((ind) => (
              <div className="flex flex-col gap-s uppercase" key={ind.code}>
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
                    {
                      data.find((item) => item.indicator_code === ind.code)
                        ?.value
                    }
                  </span>
                </p>
              </div>
            ))}
        </div>
        <p className="text-right caption uppercase">
          {getTextById(jurisdictionsCopy, "year_data", lang)}{" "}
          {government.yearData?.year_population}
        </p>
        {url && (
          <div className="flex justify-between gap-s uppercase  items-center flex-wrap">
            <p className="caption">
              {getTextById(jurisdictionsCopy, "share", lang)}
            </p>
            <div className="flex gap-s">
              <FacebookShareButton
                url={url}
                quote={shareText
                }
              >
                <FacebookIcon
                  size={32}
                  round
                  bgStyle={{ fill: "transparent" }}
                />
              </FacebookShareButton>
              <TwitterShareButton
                url={url}
                title={shareText
                }
              >
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
       
      </div> <div className="col-span-8 bg-background">
          <MapGoverment  governmentID={government.id} nivel={government.level_per_country_id.split("_")[0]} />
        </div>
    </div>
  );
}

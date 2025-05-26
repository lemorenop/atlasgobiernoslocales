import { getTextById } from "@/app/utils/textUtils";
import Image from "next/image";

export default function Card({ lang, copy, indicator, image }) {
  return (
    <div className="bg-background p-l py-[32px] md:p-[48px] flex flex-col gap-s">
      {image && <Image src={`/ods_${indicator}.png`} alt="" width={48} height={48} />}
      <h4 className="text-h4 font-bold text-navy">
        {getTextById(copy, `ind_${indicator}_title`, lang)}
      </h4>
      <p className="paragraph-small">
        {getTextById(copy, `ind_${indicator}_text`, lang)}
      </p>
    </div>
  );
}

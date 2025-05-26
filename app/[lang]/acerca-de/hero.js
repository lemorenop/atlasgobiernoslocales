import { getTextById } from "@/app/utils/textUtils";


export default function Hero({ lang, copy }) {


  return (
    <div className="grid md:grid-cols-2  bg-blue-CAF franjas-diagonales max-md:pb-[80px]">
      <div className="flex flex-col justify-between  px-l md:px-[80px] py-2xl md:py-[112px] bg-navy w-full gap-[24px]">
        <h1 className="text-h1 font-bold text-white">
          {getTextById(copy, "hero_title", lang)}
        </h1>
        <div className="border-t-[#FFFFFF66] w-full border-t-[1px]"/>
        <p className="description text-white ">
          {getTextById(copy, "hero_subtitle", lang)}
        </p>
       
      </div>
    </div>
  );
}

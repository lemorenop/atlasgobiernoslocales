import Expand from "./components/icons/expand";
import MapView from "./components/map";

export default function Hero({ hero_title, hero_subtitle, hero_explore,lang,homeMapTooltip }) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-12 bg-blue-CAF min-h-screen md:min-h-[70vh] ">
      <div className="col-span-6 lg:col-span-4 pl-l md:pl-3xl text-white flex flex-col justify-between pt-xl  pb-m pr-xl franjas-diagonales gap-xl max-md:pb-2xl">
        <div className="flex flex-col gap-m ">
          <h1 className="text-h2 font-bold">{hero_title}</h1>
          <p className="paragraph-small">{hero_subtitle}</p>
        </div>
        <div className="flex justify-between gap-m items-center">
          <p className="text-description">{hero_explore}</p>
          {/* <Expand className="w-6 h-8 stroke-white stroke-2" /> */}
        </div>
      </div>
      <div className="col-span-6 lg:col-span-8 bg-background max-md:h-[50vh] flex-grow">
        <MapView lang={lang} tooltipData={homeMapTooltip} />
      </div>
    </div>
  );
}

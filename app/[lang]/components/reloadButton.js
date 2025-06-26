import { getTextById, } from "@/app/utils/textUtils";
import ReloadIcon from "./icons/reload";

export default function ReloadButton({copy,lang,onClick}) {

  return (
    <div className="flex flex-col gap-s items-center">
      <p className="text-center text-black">
        {getTextById(copy, "error_data_message", lang)}
      </p>{" "}
      <button
        onClick={onClick}
        className="cursor-pointer px-4 py-2 bg-blue-CAF text-white border-blue-CAF font-bold border-2 group flex gap-s items-center"
      >
        {getTextById(copy, "error_data_retry", lang)}
        <div className="w-4 h-4  group-hover:rotate-90 transition-transform duration-300">
          <ReloadIcon />
        </div>
      </button>
    </div>
  );
}

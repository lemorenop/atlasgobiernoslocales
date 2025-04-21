import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import Expand from "./icons/expand";

export default function SelectLink({ options, label, path, lang,title }) {
  return (
    <>
    <p className=" paragraph-small">
      {title}
    </p>

    <Menu>
      <MenuButton className="inline-flex items-center gap-2  bg-white border-1 border-black py-1.5 px-3  shadow-inner shadow-white/10 focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer text-placeholder justify-between data-[open]:rotate-0">
      <span className=" description ">
          {label}
      </span>
      
        <Expand className="w-4 h-4 stroke-black stroke-1 rotate-90" />
      </MenuButton>

      <MenuItems
        transition
        anchor="bottom end"
        className="w-96 origin-top-right transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 bg-white text-blue-CAF border-1 border-background uppercase description p-m flex flex-col font-bold"
      >
        {options.map((option) => (
          <MenuItem key={option.slug_es} className="hover:bg-blue-CAF hover:text-white p-xs">
            <Link href={`${path}/${option[`slug_${lang}`]}`}>
              {option[`name_${lang}`]}
            </Link>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
    </>
  );
}

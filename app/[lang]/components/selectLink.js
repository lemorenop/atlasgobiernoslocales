import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";
import Expand from "./icons/expand";
import { active } from "d3";

export default function SelectLink({
  options,
  label,
  path,
  lang,
  title,
  activeOption,
}) {
  return (
    <>
      <p className=" paragraph-small">{title}</p>

      <Menu>
        <MenuButton
          className={`inline-flex items-center gap-2  bg-white border-1 border-black px-3  shadow-inner shadow-white/10 focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer text-placeholder justify-between data-[open]:rotate-0 ${
            activeOption ? "py-s" : "py-1.5 "
          }`}
        >
          {activeOption ? (
            <span className=" text-blue font-bold">{activeOption}</span>
          ) : (
            <span className=" description ">{label}</span>
          )}

          <Expand
            className={`w-4 h-4 stroke-2 rotate-90 ${
              activeOption ? "stroke-blue" : "stroke-black"
            }`}
          />
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          className="w-96 origin-top-right transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 bg-white text-blue-CAF border-1 border-background uppercase description p-m flex flex-col font-bold h-[300px] overflow-y-auto z-20"
        >
          {options.map((option) => (
            <MenuItem
              key={option.slug_es}
              className="hover:bg-blue-CAF hover:text-white p-xs"
            >
              <Link href={`/${lang}/${path}/${option[`slug_${lang}`]}`}>
                {option[`name_${lang}`]}
              </Link>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </>
  );
}

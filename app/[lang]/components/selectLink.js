import { Menu, MenuButton, MenuItem, MenuItems, MenuSection, MenuHeading } from "@headlessui/react";
import Expand from "./icons/expand";
import { active } from "d3";

export default function SelectLink({
  categories,
  options,
  label,
  path,
  lang,
  title,
  activeOption,
  colorLabel = "black",
}) {
  // Group options by category if categories exist
  const groupedOptions = categories ? categories.map(category => ({
    ...category,
    options: options.filter(option => option.category_id === category.id)
  })) : null;

  return (
    <>
    {title&&  <p
        className={` paragraph-small ${colorLabel === "white" ? "text-white":'text-black'}`}
      >
        {title}
      </p>}

      <Menu>
        <MenuButton
          className={`inline-flex items-center gap-2  bg-white border-1 border-black px-3  shadow-inner shadow-white/10 focus:outline-none  data-[focus]:outline-1 data-[focus]:outline-white cursor-pointer text-placeholder justify-between data-[open]:rotate-0 ${
            activeOption ? "py-s" : "py-1.5 "
          }`}
        >
          {activeOption ? (
            <span className=" text-blue font-bold text-left">{activeOption}</span>
          ) : (
            <span className=" description text-left">{label}</span>
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
          className="w-96 z-20 origin-top-right transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 bg-white text-blue-CAF border-1 border-background uppercase description p-m flex flex-col  font-bold h-[300px] overflow-y-auto "
        >
          {categories ? (
            // Grouped by categories
            groupedOptions.map((category,index) => (
              <MenuSection key={category.id} className="flex flex-col gap-2">
                 <MenuHeading className={`text-blue-CAF font-bold  uppercase italic ${index!==0?"border-t-1":''} border-navy pt-s `}>
                  {category[`name_${lang}`]}
                </MenuHeading>
                {category.options.map((option) => (
                  option.slug && (
                    <MenuItem
                      key={option.slug}
                      className="caption hover:bg-blue-CAF hover:text-white p-xs"
                    >
                      <a
                        className="w-full"
                        href={`/${lang}/${path}/${option.slug}`}
                      >
                        {option[`name_${lang}`]}
                      </a>
                    </MenuItem>
                  )
                ))}
              </MenuSection>
            ))
          ) : (
            // Original flat list
            options.map((option) => (
              option.slug && (
                <MenuItem
                  key={option.slug}
                  className="hover:bg-blue-CAF hover:text-white p-xs"
                >
                  <a
                    className="w-full"
                    href={`/${lang}/${path}/${option.slug}`}
                  >
                    {option[`name_${lang}`]}
                  </a>
                </MenuItem>
              )
            ))
          )}
        </MenuItems>
      </Menu>
    </>
  );
}

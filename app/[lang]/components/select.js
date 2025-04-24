"use client"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useState } from 'react'


export default function Select({options,onChange,lang,selected}) {

  return (
    <div className="mx-auto h-screen w-52 pt-20">
      <Listbox value={selected} onChange={onChange}>
        <ListboxButton
          className={"relative block w-full rounded-lg bg-white/5 py-1.5 pr-8 pl-3 text-left text-sm/6 text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          }
        >
          {selected[`name_${lang}`]}
          
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={
            'w-[var(--button-width)] rounded-xl border border-white/5 bg-white/5 p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
          }
        >
          {options.map((person) => (
            <ListboxOption
              key={person.iso3}
              value={person}
              className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
            >
           
              <div className="text-sm/6 text-white">{person[`name_${lang}`]}</div>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  )
}

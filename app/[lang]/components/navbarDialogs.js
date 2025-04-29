"use client";
import { Button, Dialog, DialogPanel } from "@headlessui/react";
import { useState } from "react";
export default function NavbarDialogs({ children, button }) {
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button onClick={open} className="cursor-pointer">
        {button}
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className=" relative z-10 focus:outline-none"
        onClose={close}
      >
        <div
          className="bg-[#004A8080] h-creen fixed inset-0 z-10 w-screen overflow-y-auto flex items-center justify-center"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <DialogPanel
            transition
            className="w-full max-w-4xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            {children}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

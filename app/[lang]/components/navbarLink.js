"use client"
import { usePathname } from "next/navigation";
export default function NavbarLink({ children, path }) {
  const pathname = usePathname();

  return (
    <div
      className={`${
        pathname.split("/")[2] === path?.toLowerCase()
          ? "font-bold"
          : "font-normal"
      }`}
    >
      {children}
    </div>
  );
}

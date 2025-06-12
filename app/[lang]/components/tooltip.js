import { useEffect, useState } from "react";

export default function Tooltip({ children, tooltip }) {
  const [position, setPosition] = useState({ x: tooltip.x, y: tooltip.y });

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const tooltipWidth = 350; // maxWidth del tooltip

      let newX = tooltip.x;
      if (tooltip.x > windowWidth / 2) {
        newX = tooltip.x - tooltipWidth / 4;
      }

      setPosition({ x: newX, y: tooltip.y });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tooltip.x, tooltip.y]);

  return (
    <div
      className="tooltip w-fit inline-block z-20 absolute bg-white pointer-events-none"
      style={{
        top: position.y,
        left: position.x,
        border: "1px solid #212529",
        padding: "16px",
        maxWidth: "350px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        opacity: 1,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {children}
    </div>
  );
}

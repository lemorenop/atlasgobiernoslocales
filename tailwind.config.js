/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
    
     
      fontSize: {
        h1: ["var(--h1-size)", { lineHeight: "var(--h1-line-height)" }],
        h2: ["var(--h2-size)", { lineHeight: "var(--h2-line-height)" }],
        h3: ["var(--h3-size)", { lineHeight: "var(--h3-line-height)" }],
        h4: ["var(--h4-size)", { lineHeight: "var(--h4-line-height)" }],
        paragraph: [
          "var(--paragraph-size)",
          { lineHeight: "var(--paragraph-line-height)" },
        ],
        "paragraph-small": [
          "var(--paragraph-small-size)",
          { lineHeight: "var(--paragraph-small-line-height)" },
        ],
        description: [
          "var(--description-size)",
          { lineHeight: "var(--description-line-height)" },
        ],
        label: [
          "var(--label-size)",
          { lineHeight: "var(--label-line-height)" },
        ],
        tooltip: [
          "var(--tooltip-size)",
          { lineHeight: "var(--tooltip-line-height)" },
        ],
        caption: [
          "var(--caption-size)",
          { lineHeight: "var(--caption-line-height)" },
        ],
      },
    },
  },
};

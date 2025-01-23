import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: ["bg-google", "bg-amazon", "bg-mercari", "bg-yahoo"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        google: "#4285f4",
        amazon: "#ff9900",
        mercari: "#ff0000",
        yahoo: "#6001d2",
      },
    },
  },
  plugins: [nextui()],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        skelar: {
          red: "#FD3433",
          "blue-85": "#222631",
          "blue-75": "#3B404C",
          "blue-60": "#616672",
          "neutral-97": "#060607",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tight: "-0.02em",
      },
      fontWeight: {
        medium: "500",
        semibold: "600",
      },
    },
  },
  plugins: [],
};

export default config;

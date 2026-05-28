import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff8ef",
        ink: "#201a2b",
        violet: "#6d4cff",
        coral: "#ff6f61",
        gold: "#e6ad2f",
        skybolt: "#2f7dff"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(32, 26, 43, 0.10)",
        lift: "0 10px 24px rgba(109, 76, 255, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;

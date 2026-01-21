import type { Config } from "tailwindcss";
import sharedConfig from "@config/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "../../packages/@kunkka/src/**/*.{vue,js,ts,jsx,tsx}",
    "../../packages/@effects/src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;

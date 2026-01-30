import type { Config } from "tailwindcss";
import sharedConfig from "@sunny-base-web/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
  content: [
    "./src/**/*.{md,vue,js,ts,jsx,tsx}",
    "../packages/@kunkka/src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  presets: [sharedConfig],
};

export default config;

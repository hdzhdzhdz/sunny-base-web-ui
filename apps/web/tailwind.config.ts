import type { Config } from "tailwindcss";
import sharedConfig from "@sunny-base-web/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "../../packages/@ui/src/**/*.{vue,js,ts,jsx,tsx}",
    "../../packages/@effects/src/**/*.{vue,js,ts,jsx,tsx}",
    "../../packages/@designer/studio/src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;

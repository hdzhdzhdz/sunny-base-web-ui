import type { Config } from "tailwindcss";
import sharedConfig from "@config/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
  content: ["./src/**/*.{vue,js,ts,jsx,tsx}"],
  presets: [sharedConfig],
};

export default config;

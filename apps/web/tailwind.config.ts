import type { Config } from "tailwindcss";
import sharedConfig from "@config/tailwind-config";

const config: Pick<Config, "content" | "presets"> = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // 扫描所有 packages 下的 src 目录
    "../../packages/**/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;

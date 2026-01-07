import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  theme: {
    extend: {
      colors: {
        primary: "#646cff",
        secondary: "#535bf2",
      },
      animation: {
        "slogan-1": "slogan-slide-1 12s infinite",
        "slogan-2": "slogan-slide-2 12s infinite",
        "slogan-3": "slogan-slide-3 12s infinite",
      },
      keyframes: {
        "slogan-slide-1": {
          "0%, 25%": { transform: "rotateX(0deg)", opacity: "1" },
          "33%, 100%": { transform: "rotateX(-90deg)", opacity: "0" },
        },
        "slogan-slide-2": {
          "0%, 25%": { transform: "rotateX(90deg)", opacity: "0" },
          "33%, 58%": { transform: "rotateX(0deg)", opacity: "1" },
          "66%, 100%": { transform: "rotateX(-90deg)", opacity: "0" },
        },
        "slogan-slide-3": {
          "0%, 58%": { transform: "rotateX(90deg)", opacity: "0" },
          "66%, 91%": { transform: "rotateX(0deg)", opacity: "1" },
          "100%": { transform: "rotateX(-90deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          25: "#f8fafc",
          850: "#0f172a"
        }
      },
      boxShadow: {
        soft: "0 20px 45px -24px rgba(15, 23, 42, 0.25)",
        inset: "inset 0 0 0 1px rgba(15, 23, 42, 0.06)"
      },
      borderRadius: {
        "2.5xl": "1.5rem"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },
  plugins: []
};

export default config;

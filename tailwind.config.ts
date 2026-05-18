import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#09090b",
        surface: "#121214",
        "surface-raised": "#18181b",
        "surface-high": "#27272a",
        line: "rgba(255,255,255,0.08)",
        "line-strong": "rgba(255,255,255,0.14)",
        primary: "#3b82f6"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        "blue-glow": "0 0 0 1px rgba(59,130,246,0.18), 0 24px 80px rgba(2,6,23,0.48)"
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        secondary: "#64748B",
        accent: "#B45309",
        surface: "#F8FAFC"
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 23, 42, 0.25)",
        card: "0 8px 24px -12px rgba(15, 23, 42, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;

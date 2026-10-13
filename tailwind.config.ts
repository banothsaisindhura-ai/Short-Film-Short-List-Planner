import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0c0c12",
          900: "#13131c",
          800: "#1b1b28",
          700: "#262636",
          600: "#34344a",
        },
        electric: {
          500: "#8b5cf6",
          400: "#a78bfa",
          600: "#7c3aed",
        },
        amberglow: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      borderRadius: { xl: "0.9rem", "2xl": "1.2rem" },
    },
  },
  plugins: [],
};
export default config;

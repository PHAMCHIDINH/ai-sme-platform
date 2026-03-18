import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecf3ff",
          100: "#dce9ff",
          200: "#bdd4ff",
          300: "#95b9ff",
          400: "#6b9cff",
          500: "#3777ff",
          600: "#1563ff",
          700: "#0f4fd0",
          800: "#103f9f",
          900: "#112f74",
        },
        ink: {
          50: "#eef2f9",
          100: "#dde5f2",
          200: "#bccbe3",
          300: "#95abc9",
          400: "#6882b9",
          500: "#4b6799",
          600: "#374f7b",
          700: "#2a3d60",
          800: "#1f2d46",
          900: "#0b1a32",
        },
        success: {
          100: "#d9f7ea",
          600: "#15945e",
          700: "#0f764b",
        },
        warning: {
          100: "#fff0d9",
          600: "#db8820",
          700: "#b56b17",
        },
        danger: {
          100: "#ffe1e6",
          600: "#d03d4b",
          700: "#a72b39",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        soft: "0 16px 36px rgba(13, 40, 92, 0.12)",
        card: "0 10px 24px rgba(13, 40, 92, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#2563eb",
          500: "#2563eb",
          600: "#2563eb",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#f8fafc",
          100: "#111827",
          200: "#1f2937",
          300: "#4b5563",
          400: "#6b7280",
          500: "#9ca3af",
          600: "#e5e7eb",
          700: "#f3f4f6",
          800: "#ffffff",
          900: "#ffffff",
          950: "#f3f4f6",
        },
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        surface: {
          DEFAULT: "#f8fafc",
          dark: "#0f172a",
          card: "#ffffff",
          "card-dark": "#1e293b",
        },
      },
    },
  },
  plugins: [],
}

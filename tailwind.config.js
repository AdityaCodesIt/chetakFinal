/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#022c22",
        "on-primary": "#064e3b",
        "surface-bright": "#134024",
        "surface-dim": "#021209",
        "on-secondary-fixed-variant": "#064e3b",
        "surface-tint": "#6ee7b7",
        "inverse-primary": "#059669",
        "surface-variant": "#164e2f",
        "on-primary-fixed": "#064e3b",
        "primary-fixed": "#6ee7b7",
        "error": "#fca5a5",
        "on-error": "#450a0a",
        "surface-container-high": "#134529",
        "surface-container-lowest": "#021209",
        "surface-container-highest": "#195331",
        "outline": "#4b7b5c",
        "secondary-fixed": "#a7f3d0",
        "background": "transparent",
        "on-primary-fixed-variant": "#047857",
        "secondary-fixed-dim": "#34d399",
        "primary": "#4ade80",
        "on-surface": "#f0fdf4",
        "tertiary-container": "#bbf7d0",
        "on-tertiary-fixed": "#064e3b",
        "secondary-container": "#065f46",
        "on-tertiary": "#064e3b",
        "tertiary": "#a7f3d0",
        "on-secondary-fixed": "#064e3b",
        "primary-fixed-dim": "#10b981",
        "error-container": "#7f1d1d",
        "primary-container": "#059669",
        "surface-container": "#0d3820",
        "on-secondary": "#ecfdf5",
        "tertiary-fixed-dim": "#34d399",
        "on-error-container": "#fecaca",
        "outline-variant": "#234a31",
        "on-tertiary-container": "#ecfdf5",
        "inverse-surface": "#f0fdf4",
        "on-background": "#f0fdf4",
        "on-primary-container": "#ecfdf5",
        "surface-container-low": "#082b18",
        "surface": "#051f11",
        "on-surface-variant": "#a7f3d0",
        "tertiary-fixed": "#6ee7b7",
        "on-secondary-container": "#ecfdf5"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Lora", "serif"],
        "body": ["Nunito", "sans-serif"],
        "label": ["Lora", "serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

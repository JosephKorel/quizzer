/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        persian: {
          DEFAULT: "#F72585",
          50: "#FDD6E8",
          100: "#FDC2DD",
          200: "#FB9BC7",
          300: "#FA74B1",
          400: "#F84C9B",
          500: "#F72585",
          600: "#DC0869",
          700: "#A6064F",
          800: "#700435",
          900: "#39021B",
        },
        sun: {
          DEFAULT: "#FAD643",
          50: "#FFFDF6",
          100: "#FEF9E2",
          200: "#FDF0BA",
          300: "#FCE792",
          400: "#FBDF6B",
          500: "#FAD643",
          600: "#F9CA0C",
          700: "#C7A105",
          800: "#917504",
          900: "#5A4902",
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#1a1b1a",
        muted: "#5f5955",
        clay: "#c86d3d",
        forest: "#1d4d45",
        cream: "#f4efe9",
      },
      boxShadow: {
        card: "0 20px 60px rgba(26, 27, 26, 0.09)",
      },
    },
  },
  plugins: [],
};

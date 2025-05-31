/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "rgb(229, 231, 235)",
        input: "rgb(229, 231, 235)",
        ring: "rgb(59, 130, 246)",
        background: "rgb(249, 250, 251)",
        foreground: "rgb(17, 24, 39)",
        primary: {
          DEFAULT: "rgb(59, 130, 246)",
          foreground: "rgb(255, 255, 255)",
        },
        secondary: {
          DEFAULT: "rgb(107, 114, 128)",
          foreground: "rgb(255, 255, 255)",
        },
        destructive: {
          DEFAULT: "rgb(239, 68, 68)",
          foreground: "rgb(255, 255, 255)",
        },
        muted: {
          DEFAULT: "rgb(243, 244, 246)",
          foreground: "rgb(107, 114, 128)",
        },
        accent: {
          DEFAULT: "rgb(243, 244, 246)",
          foreground: "rgb(17, 24, 39)",
        },
      },
    },
    fontFamily: {
      sans: ["nunito"],
    },
  },
  plugins: [require("tailwindcss-animated")],
};

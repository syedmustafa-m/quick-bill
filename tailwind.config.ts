import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ Your custom color
        "brand-blue": "#335fb3",

        // ✅ Optional: more shades
        primary: {
          50: "#f0f5ff",
          100: "#dbe7ff",
          200: "#b3ccff",
          300: "#80aaff",
          400: "#4d88ff",
          500: "#1a66ff", // primary
          600: "#0052cc",
          700: "#003d99",
          800: "#002966",
          900: "#001433",
        },
      },
    },
  },
  plugins: [],
};

export default config;

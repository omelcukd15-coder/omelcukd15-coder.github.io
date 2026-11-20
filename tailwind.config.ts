/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080612",
        surface: "#120E24",
        accent: {
          DEFAULT: "#7C3AED",
          hover: "#6D28D9",
          soft: "rgba(124, 58, 237, 0.16)",
        },
        ink: {
          DEFAULT: "#F8FAFC",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-unbounded)", "var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 50px -15px rgba(0, 0, 0, 0.7)",
        card: "0 8px 30px -6px rgba(124, 58, 237, 0.22)",
        glow: "0 0 36px rgba(124, 58, 237, 0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

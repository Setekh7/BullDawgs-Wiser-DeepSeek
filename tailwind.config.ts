import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        darkBackground: "var(--dark-background)",
        darkForeground: "var(--dark-foreground)",
        accent: "var(--accent)",
        darkAccent: "var(--dark-accent)",
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom color schemes for professional aesthetic
        brand: {
          50: '#f0f5ff',
          100: '#e1ebff',
          200: '#c8dcff',
          300: '#a1c4ff',
          400: '#70a2ff',
          500: '#3875f6', // Main brand primary blue
          600: '#255ad9',
          700: '#1d48c0',
          800: '#1e3c9b',
          900: '#1e357c',
          950: '#12204e',
        },
      },
    },
  },
  plugins: [],
}

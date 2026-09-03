/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a2e',
          50: '#f5f5f5',
          100: '#e8f5e9',
          500: '#4a7c59',
          600: '#3d6a4a',
          700: '#2d5a3a',
          800: '#1a1a2e',
        },
        accent: {
          DEFAULT: '#4a7c59',
          light: '#e8f5e9',
        },
      },
    },
  },
  plugins: [],
}

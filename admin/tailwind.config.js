/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a1a2e',
          50: '#f0f0f4',
          100: '#d4d4e0',
          200: '#a8a8c1',
          300: '#7d7da2',
          400: '#515183',
          500: '#2a2a4a',
          600: '#222240',
          700: '#1e1e38',
          800: '#1a1a2e',
          900: '#121220',
        },
        forest: {
          DEFAULT: '#6B8A0E',
          50: '#f0f7f2',
          100: '#dceee1',
          200: '#b8ddc3',
          300: '#8ec8a0',
          400: '#64b37d',
          500: '#4a7c59',
          600: '#3d6a4a',
          700: '#2d5a3a',
          800: '#1e4a2a',
          900: '#0f3a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
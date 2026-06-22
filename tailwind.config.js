/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        museum: {
          50: '#faf6f3',
          100: '#f0e6dd',
          200: '#e0ccbc',
          300: '#ccaa90',
          400: '#b88765',
          500: '#a36c4a',
          600: '#8a553d',
          700: '#724434',
          800: '#5D4037',
          900: '#4e3630',
          950: '#2b1c18',
        },
        gold: {
          50: '#fffdf0',
          100: '#fff8d9',
          200: '#ffefb0',
          300: '#ffe178',
          400: '#ffcd3f',
          500: '#FFB300',
          600: '#e09500',
          700: '#ba6d00',
          800: '#965205',
          900: '#7b4308',
        },
        risk: {
          high: '#C62828',
          medium: '#EF6C00',
          low: '#1565C0',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

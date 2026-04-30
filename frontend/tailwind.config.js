/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/app.vue",
    "./app/pages/**/*.vue",
    "./app/components/**/*.vue",
    "./app/layouts/**/*.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43', // Deep Navy
          950: '#061727',
        },
        navy: {
          DEFAULT: '#102a43',
          light: '#243b53',
          dark: '#061727',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

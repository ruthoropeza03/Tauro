/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0E1625',
        secondary: '#FFF4E3',
        accent: '#541821',
      },
    },
  },
  plugins: [],
}


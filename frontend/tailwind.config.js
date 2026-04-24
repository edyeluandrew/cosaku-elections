/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yellow': {
          500: '#F5B700',
          600: '#e6a800',
        },
        'navy': {
          900: '#0B1F3A',
          800: '#0f2540',
        },
        'emerald': {
          600: '#10B981',
        },
      },
    },
  },
  plugins: [],
};

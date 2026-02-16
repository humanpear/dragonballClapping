/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        skyArena: '#4db3ff',
        paper: '#f5ecd6'
      }
    }
  },
  plugins: []
};

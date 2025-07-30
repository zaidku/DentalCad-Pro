/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dental-primary': '#1e90ff',
        'dental-secondary': '#4169e1',
        'dental-accent': '#00bfff',
        'dental-success': '#32cd32',
        'dental-warning': '#ffa500',
        'dental-error': '#dc143c',
      },
    },
  },
  plugins: [],
};

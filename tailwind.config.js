/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        wavesBlue: '#0077b6', // Example: main WAVES blue
        wavesLightBlue: '#90e0ef',
        wavesDarkBlue: '#023e8a',
        wavesGray: '#f5f5f5',
        wavesAccent: '#00b4d8',
        wavesText: '#171717',
        wavesBackground: '#ffffff',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        heading: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}; 
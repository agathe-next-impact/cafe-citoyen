/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        violet: '#7364A9',
        rouge: '#E76556',
        jaune: '#F4D77B',
        vert: '#02a452',
        bleu: '#5e7ebd',
      },
    },
  },
  plugins: [],
};

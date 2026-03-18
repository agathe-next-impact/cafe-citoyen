module.exports = {
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
      fontFamily: {
        crimson: [
          'Crimson Text',
          'serif',
        ],
      },
      zIndex: {
        '100': '100',
        '110': '110',
        '200': '200',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-purple-50',
    'border-purple-500',
    'bg-red-50',
    'border-red-500',
    'bg-yellow-50',
    'border-yellow-500',
    'bg-emerald-50',
    'border-emerald-500',
    'bg-blue-50',
    'border-blue-500',
    'bg-gray-50',
    'border-gray-300',
    'font-crimson',
  ],
};

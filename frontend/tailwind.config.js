/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'agri-green': '#059669', // Emerald 600 - rich premium green
        'agri-dark': '#047857',  // Emerald 700 - deep green
        'agri-light': '#10b981', // Emerald 500 - vibrant accent
        'earth-brown': '#d97706', // Amber 600 - rich earth/gold accent
        'earth-dark': '#b45309',  // Amber 700 
        'surface-50': '#f8fafc',  // Slate 50 - premium off-white bg
        'surface-100': '#f1f5f9', // Slate 100
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(5, 150, 105, 0.15)',
        'premium-hover': '0 20px 40px -10px rgba(5, 150, 105, 0.25)',
      }
    },
  },
  plugins: [],
}

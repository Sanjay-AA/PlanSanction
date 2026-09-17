/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tn: {
          navy: '#0b2545',
          navyDark: '#081c33',
          navyLight: '#133a6b',
          gold: '#c29b38',
          goldLight: '#e4be5c',
          maroon: '#7c1c1d',
          sand: '#f8fafc',
          border: '#cbd5e1',
          surface: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgba(11, 37, 69, 0.08), 0 1px 2px -1px rgba(11, 37, 69, 0.08)',
        'gov-md': '0 4px 6px -1px rgba(11, 37, 69, 0.1), 0 2px 4px -2px rgba(11, 37, 69, 0.1)',
        'gov-lg': '0 10px 15px -3px rgba(11, 37, 69, 0.1), 0 4px 6px -4px rgba(11, 37, 69, 0.1)',
      }
    },
  },
  plugins: [],
}

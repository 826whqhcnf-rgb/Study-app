/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#11111a',
          850: '#161622',
          800: '#1c1c2a',
          700: '#252535',
          600: '#34344a',
          500: '#4a4a66',
          300: '#a0a0b8',
          200: '#c8c8d8',
          100: '#e6e6ef',
        },
        brand: {
          50: '#eef0ff',
          100: '#d9deff',
          200: '#b6bdff',
          300: '#8a92ff',
          400: '#6a6fff',
          500: '#5b4dff',
          600: '#4a3ce6',
          700: '#3b2fc0',
          800: '#2e2496',
        },
        accent: {
          green: '#34d399',
          red: '#f87171',
          yellow: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -8px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};

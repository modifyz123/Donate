/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Chakra Petch"', 'sans-serif'],
        'body': ['"IBM Plex Sans Thai"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff8e1',
          100: '#ffecb3',
          400: '#ffca28',
          500: '#ffc107',
          600: '#ffb300',
        },
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a28',
          600: '#242436',
        }
      }
    }
  },
  plugins: []
}

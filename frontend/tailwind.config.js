export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '0px',
      DEFAULT: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      '2xl': '0px',
      '3xl': '0px',
      full: '0px',
    },
    extend: {
      colors: {
        dark: {
          950: '#000000',
          900: '#080808',
          800: '#121212',
          700: '#181818',
          600: '#222222',
          500: '#2a2a2a',
          400: '#3f3f46',
        },
        red: {
          950: '#2c0b0e',
          900: '#450a0a',
          800: '#7f1d1d',
          700: '#991b1b',
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171',
        },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

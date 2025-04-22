/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: 'rgb(52, 152, 219)', // #3498db - Royal Blue
          600: 'rgb(41, 128, 185)', // #2980b9 - Deep Ocean Blue
        },
        emerald: {
          DEFAULT: 'rgb(46, 204, 113)', // #2ecc71 - Emerald Green
          600: 'rgb(39, 174, 96)', // #27ae60 - Forest Pulse
        },
        crimson: 'rgb(231, 76, 60)', // #e74c3c - Crimson Pop
        cloud: 'rgb(245, 245, 245)', // #f5f5f5 - Cloud Gray
        charcoal: 'rgb(51, 51, 51)', // #333333 - Charcoal Ink
        misty: 'rgb(189, 195, 199)', // #bdc3c7 - Misty Steel
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideIn: 'slideIn 0.3s ease-in-out',
        slideInFromLeft: 'slideInFromLeft 0.3s ease-in-out',
        slideInFromRight: 'slideInFromRight 0.3s ease-in-out',
        pulse: 'pulse 2s ease-in-out infinite',
      },
      boxShadow: {
        'royal-glow': '0 0 15px 2px rgba(52, 152, 219, 0.3)',
        'emerald-glow': '0 0 15px 2px rgba(46, 204, 113, 0.3)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '400': '400ms',
      },
      backgroundImage: {
        'gradient-royal': 'linear-gradient(to right, rgb(52, 152, 219), rgb(41, 128, 185))',
        'gradient-emerald': 'linear-gradient(to right, rgb(46, 204, 113), rgb(39, 174, 96))',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#E1E9F0',
          200: '#C2D2E1',
          300: '#94AFC9',
          400: '#5C84AC',
          500: '#345E8B',
          600: '#23466E',
          700: '#1B3554',
          800: '#14243A', // Primary ink/navy
          900: '#0D1726',
          950: '#070D16'
        },
        ivory: {
          DEFAULT: '#F6F3EC',
          50: '#FCFBF8',
          100: '#F6F3EC',
          200: '#ECE6D9',
          300: '#DFD6C2'
        },
        cobalt: {
          DEFAULT: '#2457D6',
          50: '#EFF4FE',
          100: '#DFEAFE',
          200: '#BFD5FD',
          300: '#93B7FB',
          400: '#5F92F7',
          500: '#3B73F3',
          600: '#2457D6', // Primary cobalt action
          700: '#1B41B0',
          800: '#18348B',
          900: '#192E6F'
        },
        coral: {
          DEFAULT: '#D65A3A',
          50: '#FDF5F3',
          100: '#FBE8E3',
          200: '#F7D3C9',
          300: '#EDB1A1',
          400: '#E18770',
          500: '#D65A3A', // Restrained coral accent
          600: '#C24627',
          700: '#A1371D',
          800: '#83301C'
        },
        scope1: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#B45309'
        },
        scope2: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
          dark: '#1D4ED8'
        },
        scope3: {
          DEFAULT: '#7C3AED',
          light: '#EDE9FE',
          dark: '#6D28D9'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans Bengali"',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}

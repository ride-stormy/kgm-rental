import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0F172A',
          accent: '#2563EB',
        },
        kgm: {
          purple: {
            dark: '#100f21',
            800: '#1f1e36',
            700: '#272541',
            600: '#2e2c4b',
            400: '#8b8aa5',
            300: '#bab9d2',
          },
          blue: {
            900: '#0b3e91',
            600: '#0A93FF',
            500: '#5bb7ff',
          },
          red: {
            400: '#de6969',
          },
        },
        blue: {
          50: '#e6f4ff',
          100: '#cfeaff',
          200: '#a7d8ff',
          500: '#0a93ff',
          600: '#0a93ff',
          700: '#007fe0',
        },
        gray: {
          50: '#f7f9fa',
          100: '#f1f4f6',
          200: '#e7edf0',
          300: '#cfd6d9',
          400: '#aeb7bc',
          500: '#6e777c',
          600: '#5e696e',
          700: '#4a5256',
          800: '#353c3f',
          900: '#222729',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
        gmarket: ['var(--font-gmarket)', 'Pretendard', 'sans-serif'],
      },
      boxShadow: {
        'kgm-1dp': '0 2px 4px 0 rgba(53, 60, 63, 0.04)',
        'kgm-4dp': '0 2px 20px 0 rgba(53, 60, 63, 0.08)',
        'kgm-8dp': '0 4px 32px 0 rgba(53, 60, 63, 0.10)',
      },
    },
  },
  plugins: [],
};

export default config;

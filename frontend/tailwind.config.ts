import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        none: '0px',
        sm: '20px',
        DEFAULT: '20px',
        md: '20px',
        lg: '20px',
        xl: '20px',
        '2xl': '20px',
        '3xl': '24px',
        full: '9999px',
      },
      colors: {
        canvas: '#0f1115',
        panel: '#151922',
        accent: '#0ea5e9',
        outline: '#1f2430',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;

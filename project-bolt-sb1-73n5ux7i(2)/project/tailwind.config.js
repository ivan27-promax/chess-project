/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: token('app'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        ink: token('text'),
        muted: token('muted'),
        gold: token('gold'),
        'gold-hover': token('gold-hover'),
        'on-gold': token('on-gold'),
        border: token('border'),
        danger: token('danger'),
        success: token('success'),
        warning: token('warning'),
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

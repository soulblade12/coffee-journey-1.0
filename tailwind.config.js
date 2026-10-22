/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-cream': '#ffedd7',
        'walnut-shadow': '#100904',
        'bark-brown': '#382416',
        'cork-border': '#40372e',
        'driftwood': '#6c5f51',
        'ember-accent': '#dc5000',
        'pure-black': '#000000',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        halyard: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        handwriting: ['"Caveat"', 'cursive'],
        serif: ['"Fraunces"', 'serif'],
      },
      fontSize: {
        'subheading': ['18px', { lineHeight: '1', letterSpacing: '0px' }],
        'heading-sm': ['24px', { lineHeight: '1.09', letterSpacing: '0px' }],
        'body-mixed': ['29px', { lineHeight: '1.26', letterSpacing: '0px' }],
        'heading': ['41px', { lineHeight: '0.9', letterSpacing: '0px' }],
        'display': ['51px', { lineHeight: '0.9', letterSpacing: '0px' }],
      },
      borderRadius: {
        'card': '12px',
        'pill': '36px',
        'ghost': '22.5px',
        'round': '9999px',
      },
    },
  },
  plugins: [],
};

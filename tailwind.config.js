module.exports = {
  darkMode: 'class',
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  content: [
    './apps/**/*.{html,ts,scss}',
    './libs/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};

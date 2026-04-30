module.exports = {
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  content: [
    './apps/**/*.{html,ts,scss}',
    './libs/**/*.{html,ts,scss}',
    './libs/api-interfaces/src/**/*.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

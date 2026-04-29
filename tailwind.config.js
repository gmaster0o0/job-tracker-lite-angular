module.exports = {
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  content: [
    './apps/frontend/src/**/*.{html,ts,scss}',
    './libs/frontend/src/**/*.{html,ts,scss}',
    './libs/api-interfaces/src/**/*.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/* eslint-disable */

const postcssConfig = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default postcssConfig;

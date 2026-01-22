// @ts-check
/** @type {import('prettier').Config} */
const config = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'as-needed',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  singleAttributePerLine: false,

  // Plugin configurations
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.ts',
  tailwindFunctions: ['cn', 'clsx', 'cva'],

  // Override patterns for specific files
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        printWidth: 100,
        singleQuote: false,
      },
    },
  ],
};

export default config;

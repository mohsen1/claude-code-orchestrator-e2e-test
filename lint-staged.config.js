module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    // Run tests for related files only if they exist
    filenames => filenames.map(filename => `vitest run --related=${filename}`),
  ],
  '*.{json,css,scss,md,yml,yaml}': [
    'prettier --write',
  ],
  // Type check TypeScript files
  '*.{ts,tsx}': [
    () => 'tsc --noEmit --pretty',
  ],
  // Check for large files
  '**/*': [
    () => 'node scripts/check-file-size.mjs',
  ],
};

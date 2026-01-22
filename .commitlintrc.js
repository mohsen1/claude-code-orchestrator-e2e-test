module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system changes
        'ci',       // CI/CD changes
        'chore',    // Other changes
        'revert',   // Revert a previous commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'db',
        'api',
        'ui',
        'components',
        'hooks',
        'utils',
        'types',
        'config',
        'deps',
        'docker',
        'tests',
      ],
    ],
    'subject-case': [0],
  },
};

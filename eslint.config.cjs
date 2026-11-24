// ESLint 9 flat configuration; maintain legacy rule severity for TUFLOW source.
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  { ignores: ['out/**', 'node_modules/**', '.vscode-test/**'] },
  // Restore the core ESLint recommended rules before TypeScript-specific overrides.
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.ts'],
    rules: {
      // Legacy command callbacks intentionally keep unused API parameters.
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
];

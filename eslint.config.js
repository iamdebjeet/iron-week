// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // TypeScript already checks namespace members; this rule can't follow enums re-exported with `export *`.
    rules: { 'import/namespace': 'off' },
  },
]);

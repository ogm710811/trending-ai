import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginPrettier from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:prettier/recommended'
  ),
  {
    ignores: [
      // Ignore build and runtime artifacts
      '**/.next/**',
      '**/out/**',
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',

      // Optional: Ignore specific file patterns
      '**/*.lock',
      '**/public/**',
    ],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];

export default eslintConfig;

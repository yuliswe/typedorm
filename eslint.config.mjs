import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import jest from 'eslint-plugin-jest';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    ],
    ignores: [
      '**/dist/**',
      '**/node_modules/',
      '**/node_modules/**',
      '**/build/**',
      '**/.aws-sam/**',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '**/__generated__/',
      '**/__generated__/**',
      '**/*.js',
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        // tsconfigRootDir: import.meta.url,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      // TODO: fix these errors related to the usage of 'any' type
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-types': ['error', { types: { '{}': false } }],
      'unused-imports/no-unused-imports-ts': 'error',
      'require-yield': 'off',
      'prefer-const': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNullish: true,
        },
      ],
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:test'],
              message: 'Please use @jest/global instead.',
            },
            {
              importNames: ['graphql'],
              group: ['graphql'],
              message: 'Please use @/typed-graphql.',
            },
            {
              importNames: ['RequestContext'],
              group: ['node-fetch'],
              message: 'Did you mean to import it from @/RequestContext?',
            },
            {
              importNames: ['program'],
              group: ['commander'],
              message:
                'Do not import "program". Use "createCommand" from src/utils/commands instead.',
            },
            {
              importNames: ['createCommand'],
              group: ['commander'],
              message:
                'Do not import "createCommand". Use "createCommand" from src/utils/commands instead.',
            },
            {
              group: [
                '@/lambdaHandler',
                '**/lambdaHandler',
                '@/sqsHandler',
                '**/sqsHandler',
              ],
              message: 'Do not import the entrypoint module.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='expect']",
          message: 'Function expressions are not allowed in source files.',
        },
      ],
      curly: 'error',
      'object-shorthand': ['error', 'always'],
      'no-useless-rename': 'error',
      'no-relative-import-paths/no-relative-import-paths': 'error',
    },
  },
  {
    files: ['**/*.spec.ts'],
    ...jest.configs['flat/recommended'],
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'testing-library/await-async-query': 'off',
      'testing-library/await-sync-query': 'off',
    },
  }
);

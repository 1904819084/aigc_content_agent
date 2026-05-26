import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/runtime-data/**',
      'frontend/src/vite-env.d.ts',
    ],
  },
  {
    files: ['frontend/src/**/*.{ts,tsx}', 'frontend/vite.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['frontend/src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../hooks/*', '../../../hooks/*'],
              message: 'components 不得直接依赖 hooks，应由 pages 负责组装。',
            },
            {
              group: ['../../services/*', '../../../services/*'],
              message: 'components 不得直接依赖 services，应通过 props 接收数据。',
            },
            {
              group: ['../../store/*', '../../../store/*'],
              message: 'components 不得直接依赖 store，应通过 props 或 hooks 适配。',
            },
            {
              group: ['../../pages/*', '../../../pages/*'],
              message: 'components 不得反向依赖 pages。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['frontend/src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../pages/*', '../../pages/*'],
              message: 'hooks 不得依赖 pages。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['frontend/src/services/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../components/*', '../../components/*'],
              message: 'services 不得依赖 UI 组件。',
            },
            {
              group: ['../pages/*', '../../pages/*'],
              message: 'services 不得依赖 pages。',
            },
            {
              group: ['../hooks/*', '../../hooks/*'],
              message: 'services 不得依赖 hooks。',
            },
            {
              group: ['../store/*', '../../store/*'],
              message: 'services 不得依赖 store。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['frontend/src/store/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../components/*', '../../components/*'],
              message: 'store 不得依赖 UI 组件。',
            },
            {
              group: ['../pages/*', '../../pages/*'],
              message: 'store 不得依赖 pages。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['backend/**/*.ts', 'eslint.config.js'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir,
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['backend/src/http/controllers/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../repositories/*', '../../domain/*'],
              message: 'controller 不得直接依赖 repositories / domain，应通过 service 访问。',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['backend/src/repositories/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../http/*', '../../app/*'],
              message: 'repositories 不得反向依赖 GuluX 应用层。',
            },
          ],
        },
      ],
    },
  },
);

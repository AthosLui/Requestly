import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      prettier, // Add Prettier as a plugin
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierConfig, // Add Prettier config last to disable conflicting rules
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 禁用 @typescript-eslint/no-explicit-any 规则
      '@typescript-eslint/no-explicit-any': 'off',

      // 其他你可能想调整的规则...
      // 例如，如果你想允许非空断言 (non-null assertion)
      // '@typescript-eslint/no-non-null-assertion': 'off',
    }
  },
])

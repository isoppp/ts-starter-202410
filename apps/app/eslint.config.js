import typescriptEslintParser from '@typescript-eslint/parser'
import tailwind from 'eslint-plugin-tailwindcss'

// only use for tailwind
export default [
  { files: ['**/*.{ts,tsx}'] },
  {
    languageOptions: {
      parser: typescriptEslintParser,
    },
  },
  ...tailwind.configs['flat/recommended'],
]

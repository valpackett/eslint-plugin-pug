import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import neostandard from 'neostandard'

export default defineConfig([
  { 
    files: ['**/*.js', '**/*.mjs'], 
    plugins: { js }, 
    extends: ['js/recommended'] 
  },
  ...neostandard({
    env: ['browser', 'jest', 'node'],
    files: ['**/*.js', '**/*.mjs'], 
    noJsx: true,
    noStyle: true,
    ts: false,
  }),
])

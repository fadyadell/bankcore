import tsEslint from 'typescript-eslint';
export default tsEslint.config(
  ...tsEslint.configs.recommended,
  { 
    ignores: ['**/dist', '**/out-tsc', 'node_modules', '**/.next', '**/build'],
    rules: { '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-unused-vars': 'off', '@typescript-eslint/ban-ts-comment': 'off', '@typescript-eslint/no-empty-object-type': 'off', '@typescript-eslint/triple-slash-reference': 'off', '@typescript-eslint/no-unsafe-function-type': 'off', '@typescript-eslint/no-wrapper-object-types': 'off' }
  }
);

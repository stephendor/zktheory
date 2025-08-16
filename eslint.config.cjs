// Minimal ESLint flat config for this repository (enables TypeScript + React linting)
module.exports = {
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
    },
    plugins: {
        react: require('eslint-plugin-react'),
        '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    settings: {
        react: { version: 'detect' }
    },
    ignores: ['node_modules/**', '.next/**', 'public/**'],
    rules: {
        // Basic project-friendly rules; keep minimal to avoid large churn
        'no-unused-vars': 'warn',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    },
    // Apply configurations for TypeScript files
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            languageOptions: {
                parser: require.resolve('@typescript-eslint/parser'),
                parserOptions: {
                    project: './tsconfig.json',
                    tsconfigRootDir: __dirname
                }
            },
            rules: {}
        }
    ]
};

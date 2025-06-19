module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2021: true,
        jest: true,
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true, // Turn off if not using JSX
        },
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended', // React specific linting rules
        'plugin:prettier/recommended', // Integrates Prettier as an ESLint rule
    ],
    plugins: ['prettier', 'react'],
    rules: {
        // Enforce arrow functions
        'prefer-arrow-callback': 'error',
        'func-style': ['error', 'expression'],

        // Prettier must be happy
        'prettier/prettier': 'error',

        // General style preferences
        'no-var': 'error',
        'prefer-const': 'error',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        eqeqeq: ['error', 'always'],
        'no-console': 'warn',
        'react/prop-types': 'off',
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
            plugins: ['@typescript-eslint'],
            rules: {
                // You can tweak TypeScript-specific rules here
            },
        },
    ],
};

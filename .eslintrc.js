module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:prettier/recommended",
        'plugin:react/jsx-runtime',
    ],
    ignorePatterns: ["dist", ".eslintrc.js", "*.mjs"],
    parser: "@typescript-eslint/parser",
    plugins: ["react-refresh", "@typescript-eslint", "react", "prettier"],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
        "no-unused-vars": "off",
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { 
              "args": "none",
              "ignoreRestSiblings": true 
            }
          ],
        endOfLine: "/r/n"
    }
};


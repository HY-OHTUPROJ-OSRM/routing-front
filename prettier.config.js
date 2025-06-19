// prettier.config.js
module.exports = {
    printWidth: 100, // Wrap lines that exceed 100 characters
    tabWidth: 4, // Use 4 spaces per indentation level
    useTabs: false, // Indent lines with spaces, not tabs
    semi: true, // End statements with a semicolon
    singleQuote: true, // Use single quotes instead of double quotes
    quoteProps: 'as-needed', // Only quote object keys when necessary
    jsxSingleQuote: false, // Use double quotes in JSX
    trailingComma: 'es5', // Add trailing commas in ES5 (objects, arrays, etc.)
    bracketSpacing: true, // Add spaces between brackets in object literals
    jsxBracketSameLine: false, // Place the `>` of multi-line JSX tags on its own line
    arrowParens: 'always', // Always include parentheses in arrow functions
    proseWrap: 'preserve', // Don't wrap markdown text
    htmlWhitespaceSensitivity: 'css', // Respect CSS display property for whitespace
    endOfLine: 'lf', // Use Unix-style line endings
};

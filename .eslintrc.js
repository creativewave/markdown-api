
module.exports = {
    extends: ['@cdoublev/eslint-config/node'],
    overrides: [
        {
            extends: ['@cdoublev/eslint-config/jest'],
            files: ['__tests__/**/*.js'],
        },
    ],
}

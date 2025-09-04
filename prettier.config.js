/** @type {import('prettier').Config } */

const config = {
    plugins: [
        "prettier-plugin-tailwindcss",
        "prettier-plugin-organize-imports",
        "prettier-plugin-sh",
    ],
    tabWidth: 4,
    overrides: [
        {
            files: [".npmrc", ".env*"],
            options: {
                parser: "sh",
            },
        },
    ],
};

export default config;

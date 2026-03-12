import serverConfig from "@kunal-singh/eslint-config/server";

export default [
  { ignores: ["**/*.config.js", "scripts/**", "dist/**"] },
  ...serverConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'github-issue-reference': (parsed) => {
          const { footer } = parsed;
          const pattern = /(?:closes|refs|fixes|see)\s+#\d+/i;
          if (!footer || !pattern.test(footer)) {
            return [
              false,
              'Footer must contain a GitHub issue reference (e.g., "closes #3")',
            ];
          }
          return [true];
        },
      },
    },
  ],
  rules: {
    'footer-leading-blank': [2, 'always'],
    'github-issue-reference': [2, 'always'],
  },
};

export default config;

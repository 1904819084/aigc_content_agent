export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'style', 'perf', 'test', 'build', 'ci', 'docs', 'chore'],
    ],
    'subject-empty': [2, 'never'],
  },
};

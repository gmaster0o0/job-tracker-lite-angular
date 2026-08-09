module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/raw/apps/api',
  coverageReporters: ['html', 'json', 'json-summary', 'lcov', 'text-summary'],
  moduleNameMapper: {
    '^@thallesp/nestjs-better-auth$':
      '<rootDir>/../../libs/shared/testing/src/lib/mocks/thallesp-nestjs-better-auth.mock.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(better-auth|@angular|@job-tracker-lite-angular)/)',
  ],
};

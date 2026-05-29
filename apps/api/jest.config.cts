module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api',
  moduleNameMapper: {
    '^@thallesp/nestjs-better-auth$':
      '<rootDir>/../../libs/shared/testing/src/lib/mocks/thallesp-nestjs-better-auth.mock.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@angular|@job-tracker-lite-angular|better-auth)/)',
  ],
};

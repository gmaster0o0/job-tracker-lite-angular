module.exports = {
  displayName: 'core-utils',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: ['node_modules/(?!(better-auth)/)'],
  coverageDirectory: '../../../coverage/raw/libs/shared/core-utils',
  coverageReporters: ['html', 'json', 'json-summary', 'lcov', 'text-summary'],
};

module.exports = {
  preset: 'jest-preset-angular',
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|angular2-ui-switch|ng-dynamic)',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jestPolyfills/setupJest.ts',
  ],
  testMatch: [
    '**/+(*.)+(spec).+(ts)?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/jestPolyfills/',
    '/src/test/',
  ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/jestPolyfills/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/test/',
  ],
  coverageReporters: [
    'html',
    'text',
    'text-summary',
    'lcovonly',
  ],
  coverageThreshold: {
    'global': {
      'branches': 60,
      'functions': 60,
      'lines': 85,
      'statements': 83,
    },
  },
  testRunner: 'jest-jasmine2',
};

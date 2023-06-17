module.exports = {
  preset: 'jest-preset-angular',
  globalSetup: 'jest-preset-angular/global-setup',
  moduleFileExtensions: ['ts', 'js', 'json', 'mjs'],
  resolver: 'jest-preset-angular/build/resolvers/ng-jest-resolver.js',
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  transform: {
    '^.+\\.(ts|js|mjs|svg)$': 'jest-preset-angular',
  },
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
      'statements': 94,
      'branches': 82,
      'functions': 81,
      'lines': 96,
    },
  }
};

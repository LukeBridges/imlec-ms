module.exports = {
  preset: 'jest-preset-angular',
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  resolver: 'jest-preset-angular/build/resolvers/ng-jest-resolver.js',
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': 'jest-preset-angular',
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
      'branches': 78,
      'functions': 72,
      'lines': 92,
      'statements': 90,
    },
  },
  testRunner: 'jest-jasmine2',
};

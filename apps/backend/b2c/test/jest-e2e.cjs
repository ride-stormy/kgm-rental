/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testMatch: ['<rootDir>/**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/../tsconfig.spec.json',
        diagnostics: { ignoreCodes: [151001] },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@kgm-rental/backend-libs/(.*)\\.js$': '<rootDir>/../../libs/src/$1',
    '^@kgm-rental/api-contracts$': '<rootDir>/../../../../packages/api-contracts/src/index',
    '^@kgm-rental/api-contracts/(.*)\\.js$': '<rootDir>/../../../../packages/api-contracts/src/$1',
  },
  testEnvironment: 'node',
  testTimeout: 30000,
};

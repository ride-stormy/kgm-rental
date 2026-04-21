/** @type {import('jest').Config} */
module.exports = {
  rootDir: '../src',
  testMatch: ['<rootDir>/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/../tsconfig.spec.json',
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
};

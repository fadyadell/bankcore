/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/libs'],
  moduleNameMapper: {
    '^@bankcore/(.*)$': '<rootDir>/libs/$1/src'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  },
  testMatch: ['**/?(*.)+(spec|test).ts']
};

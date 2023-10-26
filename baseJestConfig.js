/* eslint-disable */

function getConfig(packageName) {
  return {
    testEnvironment: 'jsdom',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    // for esm imports with .js extensions
    moduleNameMapper: {
      '^(\\.\\.?\\/.+)\\.js$': '$1',
    },
    reporters: [
      'default',
      [
        'jest-junit',
        {
          outputDirectory: '../../reports',
          outputName: `${packageName}-results.xml`,
          addFileAttribute: true,
        },
      ],
    ],
    transform: {
      '^.+\\.(t|j)sx?$': '@swc/jest',
    },
    transformIgnorePatterns: [`/node_modules/(?!nanoid)`],
  };
}

module.exports = getConfig;

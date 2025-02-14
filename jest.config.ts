import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    testEnvironment: 'node',
    preset: 'ts-jest',
    testMatch: ['**/tests/**/*.test.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage'
};

export default config;

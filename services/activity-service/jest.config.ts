// services/activity-service/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Ensure we can handle ES modules if needed, though ts-jest handles most
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
    },
  },
  // Setup file for Prisma test client connection
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  // Ignore build output
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;

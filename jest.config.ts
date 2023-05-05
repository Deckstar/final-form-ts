import type { JestConfigWithTsJest } from "ts-jest";
import { defaultsESM } from "ts-jest/presets";

const PACKAGES = [
  "final-form",
  "final-form-arrays",
  "final-form-focus",
  "react-final-form",
  "react-final-form-arrays",
];

const PROJECTS: JestConfigWithTsJest["projects"] = PACKAGES.map(
  (packageName) => ({
    displayName: packageName,
    testEnvironment: "jsdom",
    transform: {
      "^.*\\.ts?(x)?$": "ts-jest",
    },
    testMatch: [`<rootDir>/packages/${packageName}/tests/**/*.test.ts(x)?`],
    testPathIgnorePatterns: [`<rootDir>/packages/${packageName}/dist`],
  }),
);

const COLLECT_COVERAGE_FROM: JestConfigWithTsJest["collectCoverageFrom"] =
  PACKAGES.map(
    (packageName) =>
      `"<rootDir>/packages/${packageName}/tests/**/*.test.ts(x)?"`,
  );

// Sync object
const config: JestConfigWithTsJest = {
  ...defaultsESM,
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: "./",
  transform: {
    "^.*\\.ts?$": ["ts-jest", { isolatedModules: true }],
  },
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: COLLECT_COVERAGE_FROM,
  testPathIgnorePatterns: ["<rootDir>/node_modules"],
  moduleFileExtensions: ["ts", "js"],
  coverageReporters: ["json", "lcov", "html"],
  projects: PROJECTS,
  passWithNoTests: true,
};

export default config;

import { reduce } from "lodash";
import type { JestConfigWithTsJest } from "ts-jest";
import { defaultsESM } from "ts-jest/presets";

import { Package, PACKAGES } from "./scripts/_constants";

/** The list of packages in our app as a type. */
type Packages = typeof PACKAGES;

/** Maps a package name to its test locations. */
type CoverageItem<Pkg extends Package> =
  `"<rootDir>/packages/${Pkg}/tests/**/*.test.ts(x)?"`;

type CollectCoverageFrom = JestConfigWithTsJest["collectCoverageFrom"] &
  [
    CoverageItem<Packages[0]>,
    CoverageItem<Packages[1]>,
    CoverageItem<Packages[2]>,
    CoverageItem<Packages[3]>,
    CoverageItem<Packages[4]>,
  ];

const COLLECT_COVERAGE_FROM: CollectCoverageFrom = PACKAGES.map(
  (packageName): CoverageItem<typeof packageName> =>
    `"<rootDir>/packages/${packageName}/tests/**/*.test.ts(x)?"`,
) as CollectCoverageFrom;

const MODULE_NAME_MAPPER = reduce(
  PACKAGES,
  (accumulated, pkg) => {
    const key: `"${Package}"` = `"${pkg}"`;
    const src: `@deckstar/${Package}` = `@deckstar/${pkg}`;

    const option = { [key]: src };

    return { ...accumulated, ...option };
  },
  {} as { [Pkg in Package as `"${Pkg}"`]: `@deckstar/${Pkg}` },
);

// Sync object
const config: JestConfigWithTsJest = {
  ...defaultsESM,
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: "./",
  transform: {
    "^.*\\.(ts|tsx)?$": ["ts-jest", { isolatedModules: true, useESM: true }],
  },
  coverageDirectory: "<rootDir>/coverage",
  collectCoverageFrom: COLLECT_COVERAGE_FROM,
  testPathIgnorePatterns: ["<rootDir>/node_modules"],
  moduleDirectories: ["node_modules", "<rootDir>/packages"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  coverageReporters: ["json", "lcov", "html"],
  passWithNoTests: true,
  moduleNameMapper: MODULE_NAME_MAPPER,
};

export default config;

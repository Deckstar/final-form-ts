import { select } from "@inquirer/prompts";
import fs from "fs/promises";
import {
  invert,
  isPlainObject,
  map,
  mapKeys,
  mapValues,
  split,
  toNumber,
} from "lodash";

import { DESTINATION, Package, PACKAGES, Packages } from "./_constants";

const MONOREPO_PACKAGE_JSON =
  `${__dirname}/../package.json` as `${string}/../package.json`;

type VersionNumber = `${number}.${number}.${number}`;

/**
 * Prompts the user in the terminal for the new version number
 * to set in every package.
 */
const askForNewVersionNumber = async (): Promise<
  [newVersion: VersionNumber, oldVersion: VersionNumber]
> => {
  const pkgJson = (await fs.readFile(
    MONOREPO_PACKAGE_JSON,
  )) as unknown as string;
  const pkgJsonObj = JSON.parse(pkgJson);

  const currentVersion: VersionNumber = pkgJsonObj.version;

  const versionStrings = split(currentVersion, ".");
  const [major, minor, patch] = map(versionStrings, toNumber);

  const patchIncrement: VersionNumber = `${major}.${minor}.${patch + 1}`;

  const minorIncrement: VersionNumber = `${major}.${minor + 1}.0`;

  const majorIncrement: VersionNumber = `${major + 1}.0.0`;

  const questionTitle =
    "Select the version that you want to set for all packages";

  const selectedVersion = await select({
    message: questionTitle,
    choices: [
      {
        name: `${currentVersion} (current)`,
        description: "Leaves the version number the same as it is right now.",
        value: currentVersion,
      },
      {
        name: `${patchIncrement} (patch)`,
        description: "Increments by a patch version.",
        value: patchIncrement,
      },
      {
        name: `${minorIncrement} (minor)`,
        description: "Increments by a minor version.",
        value: minorIncrement,
      },
      {
        name: `${majorIncrement} (major)`,
        description: "Increments by a major version.",
        value: majorIncrement,
      },
    ],
  });

  return [selectedVersion, currentVersion];
};

type ToPackageJSONPath<PackageName extends Packages[number]> =
  `${typeof DESTINATION}/${PackageName}/package.json`;

type PackageJSONsForPackages = [
  ToPackageJSONPath<Packages[0]>,
  ToPackageJSONPath<Packages[1]>,
  ToPackageJSONPath<Packages[2]>,
  ToPackageJSONPath<Packages[3]>,
  ToPackageJSONPath<Packages[4]>,
];

/**
 * Sets the new version number in every package.json file.
 */
const setNewVersionNumber = async (newVersionNumber: VersionNumber) => {
  const pkgJSONs = [
    MONOREPO_PACKAGE_JSON,
    ...(map(PACKAGES, (pkg) => {
      const pkgJSONPath =
        `${DESTINATION}/${pkg}/package.json` as `${typeof DESTINATION}/${typeof pkg}/package.json`;

      return pkgJSONPath;
    }) as [...PackageJSONsForPackages]),
  ];

  const packagesMap = mapKeys(
    invert(PACKAGES) as unknown as Record<Package, number>,
    (_index, pkg) => `@deckstar/${pkg as Package}`,
  ) as Record<`@deckstar/${Package}`, number>;

  for (const pkgJSONPath of pkgJSONs) {
    const pkgJson = (await fs.readFile(pkgJSONPath)) as unknown as string;
    const pkgJsonObj = JSON.parse(pkgJson) as { [key: string]: any };

    const jsonWithNewPackageVersion = mapValues(
      pkgJsonObj,
      function editValue(value, key): (typeof pkgJsonObj)[string] {
        if (isPlainObject(value)) {
          const recursedObj = mapValues(value, editValue);
          return recursedObj;
        }

        if (key === "version") {
          return newVersionNumber;
        }

        if (key in packagesMap) {
          // const packageName = key as keyof typeof packagesMap;

          return newVersionNumber;
        }

        return value;
      },
    );

    const newJSONAsString = JSON.stringify(jsonWithNewPackageVersion, null, 2);

    await fs.writeFile(pkgJSONPath, `${newJSONAsString}\n`);
  }
};

(async function main() {
  const [newVersionNumber, oldVersionNumber] = await askForNewVersionNumber();

  const versionStayedTheSame = newVersionNumber === oldVersionNumber;
  if (versionStayedTheSame) return;

  await setNewVersionNumber(newVersionNumber);
})();

const fs = require("fs/promises");
const inquirer = require("inquirer");
const {
  split,
  map,
  toNumber,
  mapValues,
  invert,
  isPlainObject,
} = require("lodash");

const { DESTINATION, PACKAGES } = require("./_constants");

/** @type {`${string}/../package.json`} */
const MONOREPO_PACKAGE_JSON = `${__dirname}/../package.json`;

/**
 * @typedef {`${number}.${number}.${number}`} VersionNumber
 */

/**
 * Prompts the user in the terminal for the new version number
 * to set in every package.
 *
 * @returns {Promise<[newVersion: VersionNumber, oldVersion: VersionNumber]>}
 */
const askForNewVersionNumber = async () => {
  const pkgJson = await fs.readFile(MONOREPO_PACKAGE_JSON);
  const pkgJsonObj = JSON.parse(pkgJson);

  /** @type {VersionNumber} */
  const currentVersion = pkgJsonObj.version;

  const versionStrings = split(currentVersion, ".");
  const [major, minor, patch] = map(versionStrings, toNumber);

  /** @type {VersionNumber} */
  const patchIncrement = `${major}.${minor}.${patch + 1}`;

  /** @type {VersionNumber} */
  const minorIncrement = `${major}.${minor + 1}.0`;

  /** @type {VersionNumber} */
  const majorIncrement = `${major + 1}.0.0`;

  const questionTitle =
    "Select the version that you want to set for all packages";

  /**
   * @typedef {{ [x: string]: VersionNumber }} PromptResults
   *  @type {PromptResults}
   */
  const results = await inquirer.prompt({
    name: questionTitle,
    type: "list",
    choices: [
      { name: `${currentVersion} (current)`, value: currentVersion },
      { name: patchIncrement, value: patchIncrement },
      { name: minorIncrement, value: minorIncrement },
      { name: majorIncrement, value: majorIncrement },
    ],
  });

  const selectedVersion = results[questionTitle];
  return [selectedVersion, currentVersion];
};

/**
 * Sets the new version number in every package.json file.
 *
 * @param {VersionNumber} newVersionNumber
 */
const setNewVersionNumber = async (newVersionNumber) => {
  const pkgJSONs = [
    MONOREPO_PACKAGE_JSON,
    ...map(PACKAGES, (pkg) => {
      /** @type {`${typeof DESTINATION}/${typeof pkg}/package.json`} */
      const pkgJSONPath = `${DESTINATION}/${pkg}/package.json`;

      return pkgJSONPath;
    }),
  ];

  /** @type {Record<(typeof PACKAGES)[number], number>} */
  const packagesMap = invert(PACKAGES);

  for (const pkgJSONPath of pkgJSONs) {
    const pkgJson = await fs.readFile(pkgJSONPath);
    const pkgJsonObj = JSON.parse(pkgJson);

    const jsonWithNewPackageVersion = mapValues(
      pkgJsonObj,
      function editValue(value, key) {
        if (isPlainObject(value)) {
          /**
           * Resolutions in our monorepo "package.json" are an exception
           * — we want them to stay as they were defined.
           */
          const isResolutionsField =
            pkgJSONPath === MONOREPO_PACKAGE_JSON && key == "resolutions";
          if (isResolutionsField) return value;

          const recursedObj = mapValues(value, editValue);
          // console.log(`encountered object key: ${_key}.`, recursedObj);
          return recursedObj;
        }

        if (key === "version") {
          return newVersionNumber;
        }

        if (key in packagesMap) {
          /** @type {keyof typeof packagesMap} */
          const packageName = key;

          const packageVersion = `npm:@deckstar/${packageName}@${newVersionNumber}`;
          return packageVersion;
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

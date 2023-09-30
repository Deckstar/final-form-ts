const fs = require("fs/promises");
const path = require("path");

/**
 * @typedef {"final-form" | "final-form-arrays" | "final-form-focus" | "react-final-form" | "react-final-form-arrays"} Package
 * @typedef {"cjs" | "esm"} ModuleKind
 */

/**
 * The list of packages in our app.
 *
 * @type {["final-form", "final-form-arrays", "final-form-focus", "react-final-form", "react-final-form-arrays"]}
 */
const PACKAGES = [
  "final-form",
  "final-form-arrays",
  "final-form-focus",
  "react-final-form",
  "react-final-form-arrays",
];

/**
 * Our folders, resulting as the output of TypeScript compilation.
 * @type {["cjs", "esm"]}
 */
const DIST_FOLDERS = ["cjs", "esm"];

const SOURCE = `${__dirname}/../dist`;
const DESTINATION = `${__dirname}/../packages`;

/**
 *
 * @param {string} directory
 * @param {string} item
 */
const combinePath = (directory, item) => {
  return `${directory}/${item}`;
};

/**
 * Moves files in a folder to a new destination.
 *
 * @param {string} oldPath
 * @param {string} newPath
 */
async function recursivelyMoveFiles(oldPath, newPath) {
  const dirItems = await fs.readdir(oldPath);

  moverLoop: for (const item of dirItems) {
    const oldItemPath = combinePath(oldPath, item);
    const newItemPath = combinePath(newPath, item);

    try {
      const filepath = path.resolve(oldPath, item);
      const stat = await fs.stat(filepath);
      const isFolder = stat && stat.isDirectory();

      if (isFolder) {
        await recursivelyMoveFiles(oldItemPath, newItemPath);
      } else {
        try {
          await fs.readdir(newPath);
        } catch (error) {
          await fs.mkdir(newPath, { recursive: true });
        }

        await fs.rename(oldItemPath, newItemPath);
      }
    } catch (_loopError) {
      // eslint-disable-next-line no-console
      console.error(_loopError);

      break moverLoop;
    }
  }
}

/**
 * @param {Package} pkg
 * @param {ModuleKind} kind
 */
const movePackage = async (pkg, kind) => {
  const oldPath = `${SOURCE}/${kind}/packages/${pkg}/src`;
  const newPath = `${DESTINATION}/${pkg}/dist/${kind}`;

  await recursivelyMoveFiles(oldPath, newPath);
};

/**
 *  @param {ModuleKind} kind
 */
const moveFolder = async (kind) => {
  for (const pkg of PACKAGES) {
    await movePackage(pkg, kind);
  }
};

const moveCompiled = async () => {
  for (const folder of DIST_FOLDERS) {
    await moveFolder(folder);
  }
};

(async function main() {
  await moveCompiled();

  await fs.rm(SOURCE, { force: true, recursive: true });
})();

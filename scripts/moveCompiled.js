const fs = require("fs/promises");
const path = require("path");

const {
  DESTINATION,
  DIST_FOLDERS,
  PACKAGES,
  TS_OUTPUT_DIR,
} = require("./_constants");

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
  const oldPath = `${TS_OUTPUT_DIR}/${kind}/packages/${pkg}/src`;
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

  await fs.rm(TS_OUTPUT_DIR, { force: true, recursive: true });
})();

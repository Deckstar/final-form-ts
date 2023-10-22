import fs from "fs/promises";
import path from "path";

import {
  DESTINATION,
  DIST_FOLDERS,
  ModuleKind,
  Package,
  PACKAGES,
  TS_OUTPUT_DIR,
} from "./_constants";
import { makeLogger } from "./_logger";

/**
 * Combines a directory with a file into a file path.
 */
const combinePath = (directory: string, item: string) => {
  return `${directory}/${item}`;
};

/**
 * Moves files in a folder to a new destination.
 */
async function recursivelyMoveFiles(oldPath: string, newPath: string) {
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
 * Moves a package's files from "dist" into the package's folder.
 */
const movePackage = async (pkg: Package, kind: ModuleKind) => {
  const oldPath = `${TS_OUTPUT_DIR}/${kind}/packages/${pkg}/src` as const;
  const newPath = `${DESTINATION}/${pkg}/dist/${kind}` as const;

  await recursivelyMoveFiles(oldPath, newPath);
};

/**
 * One-by-one, moves all the packages in a TS output folder.
 */
const moveFolder = async (kind: ModuleKind) => {
  for (const pkg of PACKAGES) {
    await movePackage(pkg, kind);
  }
};

/**
 * Moves all TS outputs to their package folders.
 */
const moveCompiled = async () => {
  for (const folder of DIST_FOLDERS) {
    await moveFolder(folder);
  }
};

(async function main() {
  const log = makeLogger();
  log("Moving compiled files...");

  await moveCompiled();

  await fs.rm(TS_OUTPUT_DIR, { force: true, recursive: true });
})();

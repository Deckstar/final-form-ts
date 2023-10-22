import { exec as execSync } from "child_process";
import util from "util";

import { DIST_FOLDERS, ModuleKind } from "./_constants";
import { makeLogger } from "./_logger";

const exec = util.promisify(execSync);

/** Hex code for TypeScript logo. */
const TS_COLOR = "#2E78C7";

/** Colored `console.log` message, using `chalk`. */
const log = makeLogger(TS_COLOR);

/** Outputs TypeScript files. */
const compile = async (kind: ModuleKind) => {
  await exec(`tsc --build --force tsconfig.${kind}.json`);
};

/** Runs compilation for all output kinds. */
const compileAll = async () => {
  log("Compiling TypeScript files:");

  for (const kind of DIST_FOLDERS) {
    log(`  - to ${kind}...`);

    await compile(kind);
  }
};

(async function main() {
  await compileAll();
})();

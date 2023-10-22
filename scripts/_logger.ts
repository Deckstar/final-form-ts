import chalk from "chalk";

const CHALK_DEFAULT = chalk.bold;

/** Creates a `log` function based on a color for the `chalk` instance, that logs text to the console. */
export const makeLogger = (color: string = "#FFFFFF") => {
  const logger = CHALK_DEFAULT.hex(color);

  return (text: string) => {
    // eslint-disable-next-line no-console
    console.log(logger(text));
  };
};

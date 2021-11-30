// const arg = require("arg");
const { prompts } = require("../lib/prompts");

// function parseArgs(rawArgs) {
//   const expectedArgs = arg(
//     {
//       "--init": Boolean,
//       "--help": Boolean,
//       "--connect": Boolean,
//     },
//     {
//       argv: rawArgs.slice(2)
//     }
//   );

//   return {
//     runInit: expectedArgs["--init"] || false,
//     showHelp: expectedArgs["--help"] || false,
//     connect: expectedArgs["--connect"] || false,
//   }
// }

module.exports = async function help(args) {
  prompts.displayHelp();
}
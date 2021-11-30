const sh = require("shelljs");
// const arg = require("arg");
const appName = 'lodge-app';
const vpcOutput = require(`${appName}/outputs.json`).LodgeVPCStack;

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

function SSMConnect(id) {
  sh.cd(appName);
  sh.exec(`aws ssm start-session --target ${id}`);
}

module.exports = async function connect(args) {
  const bastionOutput = Object.keys(vpcOutput).find(key => key.includes('SSH'));
  const bastionId = vpcOutput[bastionOutput];
  SSMConnect(bastionId);
}
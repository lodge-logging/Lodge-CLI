const sh = require("shelljs");
const arg = require("arg");
const { Client } = require("ssh2");
const { prompts } = require("../lib/prompts");
const stackName = "ReginaStack";


function getIPFromCidr(cidr) {
  // func 
}

function cloneAndInstall(repo) {
  sh.exec(`gh repo clone ${repo}`);
  sh.cd(repo.split("/")[1]);
  sh.exec("npm install");
}

function parseArgs(rawArgs) {
  const expectedArgs = arg(
    {
      "--install": Boolean,
      "--help": Boolean,
      "-i": "--install",
    },
    {
      argv: rawArgs.slice(2)
    }
  );

  return {
    runInstall: expectedArgs["--install"] || false,
    showHelp: expectedArgs["--help"] || false,
  }
}

function deployToExistingVPC(config) {
  const VPC_ID = config.vpcId;
  const APP_CIDR = config.existingSubnetCIDR;
  const IP_ADDRESSES = getThreeIps(APP_CIDR);

  cloneAndInstall("rgdonovan/frontend-todo-app");
  // pass cidr to func and get 3 ips as list of strings. Write to json file in curr directory.
  sh.exec(`cdk deploy ${stackName} --context VPC_ID=${VPC_ID} --context APP_CIDR=${APP_CIDR} --context IP_ADDRESSES=${IP_ADDRESSES}`);
}

function deployToNewVPC(config) {
  const APP_CIDR = config.newVPCCIDR;
  const USER_CIDR = config.whitelistCIDR;

  cloneAndInstall("rgdonovan/frontend-todo-app");
  sh.exec(`cdk deploy ${stackName} --context USER_CIDR=${USER_CIDR} --context APP_CIDR=${APP_CIDR}`);
}

async function cli(args) {
  let choices = parseArgs(args);

  if (choices.showHelp) {
    prompts.displayHelp();
  } else if (choices.runInstall) {
    const config = await prompts.install();
    if (config.vpcId) {
      console.log(getSubnetCidr(config.subnetId));
      // deployToExistingVPC(config);
    } else {
      // deployToNewVPC(config);
    }
  }
}

/* do in stages. 
  X Tell them we assume they've already installed and configured aws cli
  X look in to automating cdk installation so they can run it. 
  X clone repo and npm install dependencies

  deploy cdk 
  wait for it to be done
  run cdk deploy again
  wait for it to be done again
 
  'lodge connect' and be able to run 'connect' to SSH to bastion host. 
  celebrate
*/

exports.cli = cli;
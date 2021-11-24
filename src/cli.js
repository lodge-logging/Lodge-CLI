const sh = require("shelljs");
const arg = require("arg");
const { Client } = require("ssh2");
const path = require('path');
const { prompts } = require("../lib/prompts");
const { getIps } = require('../lib/utils/getIps');
const stackName = "ReginaStack";
const stackPath = path.join(__dirname, '..', '..', 'lodge-app');
const BASTION_ID = ""; //should be in outputs.json after deployment

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
      "--connect": Boolean,
      "-i": "--install",
    },
    {
      argv: rawArgs.slice(2)
    }
  );

  return {
    runInstall: expectedArgs["--install"] || false,
    showHelp: expectedArgs["--help"] || false,
    connect: expectedArgs["--connect"] || false,
  }
}

function deployToExistingVPC(config) {
  const VPC_ID = config.vpc.id;
  const VPC_CIDR = config.vpc.cidr;
  const IP_ADDRESSES = getIps(config.subnets).join(',');

  //cloneAndInstall("rgdonovan/frontend-todo-app");
  // pass cidr to func and get 3 ips as list of strings. Write to json file in curr directory.
  sh.cd(stackPath);
  sh.exec(`cdk deploy ${stackName} --context VPC_ID=${VPC_ID} --context VPC_CIDR=${VPC_CIDR} --context IP_ADDRESSES=${IP_ADDRESSES}`);
}

function deployToNewVPC(config) {
  const APP_CIDR = config.newVPCCIDR;
  const USER_CIDR = config.userVPCCIDR;

  // cloneAndInstall("rgdonovan/frontend-todo-app");
  sh.cd(stackPath);
  sh.exec(`cdk deploy ${stackName} --context USER_CIDR=${USER_CIDR} --context APP_CIDR=${APP_CIDR}`);
}

function SSMConnect(id) {
  sh.cd(stackPath);
  sh.exec(`aws ssm start-session --target ${id}`);
}

async function cli(args) {
  let choices = parseArgs(args);

  if (choices.showHelp) {
    prompts.displayHelp();
  } else if (choices.runInstall) {
    const config = await prompts.install();
    if (config.deployment === "Use an existing VPC") {
      deployToExistingVPC(config);
    } else {
      deployToNewVPC(config);
    }
  } else if (choices.connect) {
    SSMConnect(BASTION_ID);
  }
}

/* do in stages. 
  X Tell them we assume they've already installed and configured aws cli
  X look in to automating cdk installation so they can run it. 
  X clone repo and npm install dependencies
 
  'lodge connect' and be able to run 'connect' to SSH to bastion host. 
  celebrate
*/

exports.cli = cli;
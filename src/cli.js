const sh = require("shelljs");
const arg = require("arg");
const path = require('path');
const { prompts } = require("../lib/prompts");
const { getIps } = require('../lib/utils/getIps');
const repo = 'https://github.com/lodge-logging/Lodge.git';
const stackName = "LodgeAppStage";
const appName = 'lodge-app';
const stackPath = path.join(__dirname, appName);

function cloneAndInstall(repo) {
  sh.exec(`git clone ${repo} ${appName}`);
  sh.cd(`./${appName}`);
  sh.exec("npm install");
}

function parseArgs(rawArgs) {
  const expectedArgs = arg(
    {
      "--init": Boolean,
      "--help": Boolean,
      "--connect": Boolean,
    },
    {
      argv: rawArgs.slice(2)
    }
  );

  return {
    runInit: expectedArgs["--init"] || false,
    showHelp: expectedArgs["--help"] || false,
    connect: expectedArgs["--connect"] || false,
  }
}

function deployToExistingVPC(config) {
  const VPC_ID = config.vpc.id;
  const VPC_CIDR = config.vpc.cidr;
  const IP_ADDRESSES = getIps(config.subnets).join(',');

  cloneAndInstall(repo);
  sh.exec(`cdk deploy ${stackName} --context VPC_ID=${VPC_ID} --context VPC_CIDR=${VPC_CIDR} --context IP_ADDRESSES=${IP_ADDRESSES}`);
}

function deployToNewVPC(config) {
  const APP_CIDR = config.newVPCCIDR;
  const USER_CIDR = config.userVPC.cidr;
  const USER_VPC_ID = config.userVPC.id;

  cloneAndInstall(repo);
  sh.cd(appName);
  sh.exec(`cdk deploy ${stackName} --context APP_CIDR=${APP_CIDR} --context USER_CIDR=${USER_CIDR} --context USER_VPC_ID=${USER_VPC_ID}`);
}

function SSMConnect(id) {
  console.log(id);
  sh.cd(appName);
  //sh.exec(`aws ssm start-session --target ${id}`);
}

async function cli(args) {
  let choices = parseArgs(args);

  if (choices.showHelp) {
    prompts.displayHelp();
  } else if (choices.runInit) {
    const config = await prompts.init();
    if (config.deployment === "Use an existing VPC") {
      deployToExistingVPC(config);
    } else {
      deployToNewVPC(config);
    }
  } else if (choices.connect) {
    const BASTION_ID = require(`${appName}/outputs.json`);
    SSMConnect(BASTION_ID);
  }
}

exports.cli = cli;
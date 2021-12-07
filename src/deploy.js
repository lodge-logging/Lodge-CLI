const sh = require("shelljs");
// const arg = require("arg");
const { prompts } = require("../lib/prompts");
const { getIps } = require('../lib/utils/getIps');
const appName = 'lodge-app';

function deployToExistingVPC(config) {
  const VPC_ID = config.vpc.id;
  const VPC_CIDR = config.vpc.cidr;
  const IP_ADDRESSES = JSON.stringify(getIps(config.subnets));

  sh.cd(appName);
  sh.exec(`echo ${IP_ADDRESSES} | tee subnets.json`);
  sh.exec(`cdk deploy --all -y --context VPC_ID=${VPC_ID} --context VPC_CIDR=${VPC_CIDR}`);
}

function deployToNewVPC(config) {
  const APP_CIDR = config.newVPCCIDR;
  const USER_CIDR = config.userVPC.cidr;
  const USER_VPC_ID = config.userVPC.id;


  sh.cd(appName);
  sh.exec(`cdk deploy --all -y --context APP_CIDR=${APP_CIDR} --context USER_CIDR=${USER_CIDR} --context USER_VPC_ID=${USER_VPC_ID}`);
}

module.exports = async function deploy(args) {
  const config = await prompts.deploy();
  if (config.deployment === "Use an existing VPC") {
    deployToExistingVPC(config);
  } else {
    deployToNewVPC(config);
  }
}
const sh = require("shelljs");
const { writeFileSync } = require('fs');
const { prompts } = require("../lib/prompts");
const { getIps } = require('../lib/utils/getIps');
const appName = 'lodge-app';
const subnetPath = 'subnets.json';

function deployToExistingVPC(config) {
  const VPC_ID = config.vpc.id;
  const VPC_CIDR = config.vpc.cidr;
  const IP_ADDRESSES = getIps(config.subnets);
  const PRIVATE_SUBNET = config.privateSubnet;
  const SUBNETS = Object.assign(IP_ADDRESSES, {privateSubnet: PRIVATE_SUBNET});

  sh.cd(appName);
  writeFileSync(subnetPath, JSON.stringify(SUBNETS));
  sh.exec(`cdk deploy --all -y --context VPC_ID=${VPC_ID} --context VPC_CIDR=${VPC_CIDR}`);
}

function deployToNewVPC(config) {
  const APP_CIDR = config.newVPCCIDR;

  sh.cd(appName);

  sh.exec(`cdk deploy --all -y --context APP_CIDR=${APP_CIDR}`);
}

module.exports = async function deploy(args) {
  const config = await prompts.deploy();
  if (config.deployment === "Use an existing VPC") {
    deployToExistingVPC(config);
  } else {
    deployToNewVPC(config);
  }
}
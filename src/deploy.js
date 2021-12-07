const sh = require("shelljs");
const { writeFileSync } = require('fs');
const { prompts } = require("../lib/prompts");
const { getIps } = require('../lib/utils/getIps');
const appName = 'lodge-app';
const contextPath = 'user-data.json';
let CONTEXT =  {
  privateSubnets: {
    subnetA: {
      id: '',
      ip: '',
      az: ''
    },
    subnetB: {
      id: '',
      ip: '',
      az: ''
    },
    subnetC: {
      id: '',
      ip: '',
      az: ''
    }
  },
  publicSubnet: { id: '', az: '' },
  lodgeVpc: { id: '', cidr: '' },
  userCidr: ''
};

function deployToExistingVPC(config) {
  const PRIVATE_SUBNETS = getIps(config.subnets);
  const PUBLIC_SUBNET = config.publicSubnet;

  CONTEXT.privateSubnets = PRIVATE_SUBNETS;
  CONTEXT.publicSubnet = PUBLIC_SUBNET;
  CONTEXT.lodgeVpc = config.lodgeVpc;
  CONTEXT.userCidr = config.userCidr;

  sh.cd(appName);
  writeFileSync(contextPath, JSON.stringify(CONTEXT));
  sh.exec('cdk deploy --all -y');
}

function deployToNewVPC(config) {
  CONTEXT.lodgeVpc = config.lodgeVpc;
  CONTEXT.userCidr = config.userCidr;

  sh.cd(appName);
  writeFileSync(contextPath, JSON.stringify(CONTEXT));
  sh.exec('cdk deploy --all -y');
}

module.exports = async function deploy(args) {
  const config = await prompts.deploy();
  if (config.deployment === "Use an existing VPC") {
    deployToExistingVPC(config);
  } else {
    deployToNewVPC(config);
  }
}
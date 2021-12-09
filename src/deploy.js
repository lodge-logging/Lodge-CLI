const sh = require("shelljs");
const { writeFileSync } = require('fs');
const { prompts } = require("../lib/prompts/deploy-prompts");
const { EXISTING_VPC, COMMANDS, APP_NAME, CONTEXT, CONTEXT_PATH, OUTPUT_FILE } = require('../lib/constants');


async function deployToExistingVPC(config) {
  const PRIVATE_SUBNETS = config.privateSubnets;
  const PUBLIC_SUBNET = config.publicSubnet;

  CONTEXT.privateSubnets = PRIVATE_SUBNETS;
  CONTEXT.publicSubnet = PUBLIC_SUBNET;
  CONTEXT.lodgeVpc = config.lodgeVpc;
  CONTEXT.userCidr = config.userCidr;
  
  sh.cd(APP_NAME);
  writeFileSync(CONTEXT_PATH, JSON.stringify(CONTEXT));
  sh.exec(`${COMMANDS.DEPLOY} ${OUTPUT_FILE}`);
}

async function deployToNewVPC(config) {
  CONTEXT.lodgeVpc = config.lodgeVpc;
  CONTEXT.userCidr = config.userCidr;

  sh.cd(APP_NAME);
  writeFileSync(CONTEXT_PATH, JSON.stringify(CONTEXT));
  sh.exec(`${COMMANDS.DEPLOY} ${OUTPUT_FILE}`);
}

module.exports = async function deploy(args) {
  try {
    const config = await prompts.deploy();
    if (config.deployment === EXISTING_VPC) {
      await deployToExistingVPC(config);
    } else {
      await deployToNewVPC(config);
    }
  } catch (error) {
    console.error(error);
  }
}
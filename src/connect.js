const sh = require("shelljs");
const { COMMANDS, APP_NAME, OUTPUT_FILE } = require('../lib/constants');

function SSMConnect(id) {
  sh.cd(APP_NAME);
  sh.exec(`${COMMANDS.CONNECT} ${id}`);
}

module.exports = async function connect(args) {
  try {
    const vpcOutput = require(`${APP_NAME}/${OUTPUT_FILE}`).LodgeVPCStack;
    const bastionOutput = Object.keys(vpcOutput).find(key => key.includes('SSH'));
    const bastionId = vpcOutput[bastionOutput];
    SSMConnect(bastionId);
  } catch (error) {
    console.error(error);
  }
}
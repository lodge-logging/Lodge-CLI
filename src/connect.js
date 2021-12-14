const sh = require("shelljs");
const { COMMANDS, APP_NAME, OUTPUT_FILE, BASTION_STACK_NAME } = require('../lib/constants');

function SSMConnect(id) {
  sh.cd(APP_NAME);
  sh.exec(`${COMMANDS.CONNECT} ${id}`);
}

module.exports = async function connect(args) {
  try {
    const bastionOutput = require(`${APP_NAME}/${OUTPUT_FILE}`)[BASTION_STACK_NAME];
    const bastionId = bastionOutput[0];
    SSMConnect(bastionId);
  } catch (error) {
    console.error(error);
  }
}
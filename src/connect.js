const sh = require("shelljs");
const path = require('path');

const { COMMANDS, APP_NAME, OUTPUT_FILE, BASTION_STACK_NAME } = require('../lib/constants');

function SSMConnect(id) {
  sh.cd(APP_NAME);
  sh.exec(`${COMMANDS.CONNECT} ${id}`);
}

module.exports = async function connect(args) {
  try {
    const bastionOutput = require(path.join(__dirname, OUTPUT_FILE))[BASTION_STACK_NAME]
    const idOutputKey = Object.keys(bastionOutput).find(key => key.includes('SSH'));
    const bastionId = bastionOutput[idOutputKey];

    SSMConnect(bastionId);
  } catch (error) {
    console.error(error);
  }
}
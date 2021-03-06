const sh = require("shelljs");
const prompts = require("../lib/prompts/destroy-prompts");
const { APP_NAME, COMMANDS, KEY_NAME } = require('../lib/constants');

module.exports = async function destroy(args) {
  try {
    const confirm = await prompts.destroy();
    if (confirm) {
      sh.cd(APP_NAME);
      sh.exec(COMMANDS.DESTROY);
      sh.exec(`${COMMANDS.DELETE_KEY} ${KEY_NAME}`);
    }
  } catch (error) {
    console.error(error);
  }
}
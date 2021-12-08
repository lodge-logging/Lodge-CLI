const sh = require("shelljs");
const { execSync } = require("child_process");
const { writeFileSync } = require("fs");
const { APP_NAME, COMMANDS, KEY_NAME, KEY_PATH, REPO } = require('../lib/constants');

const options = {stdio : 'pipe' };

async function generateKey() {
  try {
    const res = execSync(`${COMMANDS.CREATE_KEY} ${KEY_NAME}`);
    const key = JSON.parse(res).KeyMaterial
    writeFileSync(KEY_PATH, key);
  } catch (error) {
    console.log(error);
  }
}

async function cloneAndInstall(repo) {
  sh.exec(`git clone ${repo} ${APP_NAME}`);
  sh.cd(APP_NAME);
  sh.exec("npm install");
}

module.exports = async function init(args) {
  try {
    await cloneAndInstall(REPO);
    await generateKey();
  } catch (error) {
    console.error(error);
  }
}
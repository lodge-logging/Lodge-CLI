const sh = require("shelljs");
const repo = 'https://github.com/lodge-logging/Lodge.git';
const appName = 'lodge-app';

function cloneAndInstall(repo) {
  sh.exec(`git clone ${repo} ${appName}`);
  sh.cd(`./${appName}`);
  sh.exec("npm install");
}

module.exports = async function init(args) {
  cloneAndInstall(repo);
}
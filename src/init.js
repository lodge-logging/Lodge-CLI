const sh = require("shelljs");
const { execSync } = require("child_process");
const { writeFileSync } = require("fs");
const repo = 'https://github.com/lodge-logging/Lodge.git';
const appName = 'lodge-app';
const keyPath = 'bin/lodge-key.pem';
const options = {stdio : 'pipe' };

async function generateKey() {
  const params = {
    KeyName: "lodge-key",
  };
  try {
    const res = execSync('aws ec2 create-key-pair --key-name lodge-key');
    const key = JSON.parse(res).KeyMaterial
    writeFileSync(keyPath, key);
  } catch (error) {
    console.log(error);
  }
}

async function cloneAndInstall(repo) {
  sh.exec(`git clone ${repo} ${appName}`);
  sh.cd(appName);
  sh.exec("npm install");
}

module.exports = async function init(args) {
  await cloneAndInstall(repo);
  await generateKey();
}
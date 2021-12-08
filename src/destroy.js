const sh = require("shelljs");
const { prompts } = require("../lib/prompts");
const appName = 'lodge-app';

module.exports = async function destroy(args) {
  const confirm = await prompts.destroy();
  if (confirm) {
    sh.cd(appName);
    sh.exec('cdk destroy --all --force');
    sh.exec('aws ec2 delete-key-pair --key-name lodge-key');
  }
}
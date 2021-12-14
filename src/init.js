const sh = require("shelljs");
const art = require("ascii-art");
const { execSync } = require("child_process");
const { writeFileSync } = require("fs");
const { checkGlobalInstall } = require("../lib/aws");
const {
  APP_NAME,
  COMMANDS,
  KEY_NAME,
  KEY_PATH,
  REPO,
} = require("../lib/constants");

const options = { stdio: "pipe" };

async function generateKey() {
  let res;
  try {
    console.log("Generating SSH key...");
    res = execSync(`${COMMANDS.CREATE_KEY} ${KEY_NAME}`, options);
    console.log(art.style("Done", "green"));
  } catch (error) {
    console.log(
      art.style("Failed to create SSH key. Please see error below:", "red")
    );
    console.log(error);
    process.exit();
  }

  try {
    const key = JSON.parse(res).KeyMaterial;
    console.log(`Writing SSH key to ${KEY_PATH}...`);
    writeFileSync(KEY_PATH, key);
  } catch (error) {
    console.error(
      art.style("Failed to write key to file. Please see error below:", "red")
    );
    console.error(error);
    process.exit();
  }
}

async function cloneAndInstall(repo) {
  try {
    console.log("Cloning CDK app into lodge-app directory...");
    execSync(`git clone ${repo} ${APP_NAME}`, options);
    console.log(art.style("Done", "green"));
  } catch (error) {
    console.error(art.style("Clone failed. Please see error below: ", "red"));
    console.error(error);
    process.exit();
  }

  sh.cd(APP_NAME);

  try {
    console.log("Installing CDK app dependencies...");
    execSync("npm install", options);
    console.log(art.style("Done", "green"));
  } catch (error) {
    console.error(
      art.style(
        "Failed to install dependencies. Please see error below:",
        "red"
      )
    );
    console.error(error);
    process.exit();
  }
}

async function checkRegion() {
  try {
    const res = execSync(COMMANDS.GET_AZS);
    const azList = JSON.parse(res).AvailabilityZones;
    if (azList.length < 3) {
      console.error(
        `AWS Region ${azList[0].RegionName} has less than 3 availability zones. Please use a different region`
      );
      process.exit();
    }
  } catch (error) {
    console.error(
      art.style(
        "Failed to fetch availability zones from your region. Is your AWS CLI configured?",
        "red"
      )
    );
    console.error(error);
  }
}

module.exports = async function init(args) {
  try {
    console.log(
      "Verifying global installation of AWS CLI, AWS CDK, and AWS SSM..."
    );
    await checkGlobalInstall(["aws", "cdk", "aws ssm"]);
    console.log(art.style("Verified", "green"));
    console.log("Verifying 3 availability zones in your region...");
    await checkRegion();
    console.log(art.style("Verified", "green"));
  } catch (error) {
    console.error(error);
  }
  try {
    await cloneAndInstall(REPO);
    await generateKey();
    console.log(
      'Lodge initialization complete. Run "lodge deploy" to deploy Lodge'
    );
  } catch (error) {
    console.error(error);
  }
};

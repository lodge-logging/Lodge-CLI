const inquirer = require("inquirer");

const prompts = {
  displayHelp() {
    const message = `Lodge is a framework for standing up your own ELK stack on AWS.\nRun 'lodge --install' or 'lodge --i' to get started.`;
    console.log(message);
  },

  async install() {
    console.clear();
    this._displayWelcome();
    await this._confirmAWSPrompt();
    return await this._configPrompt();
  },

  _displayWelcome() {
    console.log(`Welcome to Lodge!\nLodge will be installed in the current directory.`);
  },

  async _confirmAWSPrompt() {
    console.log(`This installation assumes you already have the AWS CLI installed and configured.`);

    const answer = await inquirer.prompt([{
      type: "confirm",
      name: "confirm",
      message: `If this is correct, please confirm`,
    }]);

    if (!answer.confirm) process.exit();
  },

  async _configPrompt() {
    const questions = [
      {
        type: "list",
        name: "vpc",
        message: "Please choose how you wish to install Lodge:",
        choices: ["Use an existing VPC", "Spin up a new VPC"],
      },
      {
        type: "list",
        name: "vpcId",
        message: "Please choose the id of the VPC you wish to deploy to",
        choices: [],
        when: (answers) => answers.vpc === "Use an existing VPC"
      },
      {
        type: "choice",
        name: "subnetId1",
        message: "We will need the ids of three separate, empty subnets in this VPC. Please choose the id of the first subnet you wish to deploy in",
        choices: [],
        when: (answers) => answers.vpc === "Use an existing VPC"
      },
      {
        type: "choice",
        name: "subnetId2",
        message: "Please choose the id of the second subnet you wish to deploy in",
        choices: [],
        when: (answers) => answers.vpc === "Use an existing VPC"
      },
      {
        type: "choice",
        name: "subnetId3",
        message: "Please choose the id of the third subnet you wish to deploy in",
        choices: [],
        when: (answers) => answers.vpc === "Use an existing VPC"
      },
      {
        type: "input",
        name: "newVPCCIDR",
        message: "Enter a unique CIDR Block to deploy your new VPC in",
        validate: this._validateCIDR,
        when: (answers) => answers.vpc === "Spin up a new VPC"
      },
      {
        type: "input",
        name: "whitelistCIDR",
        message: "Input a valid CIDR Block to whitelist",
        validate: this._validateCIDR,
        when: (answers) => answers.vpc === "Spin up a new VPC"
      },
    ];

    let configConfirmed;
    let answers;

    while (!configConfirmed) {
      answers = await inquirer.prompt(questions);
      const confirmation = await inquirer.prompt([
        {
          type: "confirm",
          name: "choice",
          message: this._confirmConfigMessage(answers),
        }
      ]);
      configConfirmed = confirmation.choice;
    }
    return answers;
  },

  _confirmConfigMessage(answers) {
    return (answers.vpc === "Use an existing VPC") ?
      `Is this correct? 
      Installation Type: ${answers.vpc}
      Subnet id #1: ${answers.subnetId1}
      Subnet id #2: ${answers.subnetId2}
      Subnet id #3: ${answers.subnetId3}
      CIDR to whitelist: ${answers.whitelistCIDR};`
      :
      `Is this correct? 
      Installation Type: ${answers.vpc}
      New VPC CIDR: ${answers.newVPCCIDR}
      CIDR to whitelist: ${answers.whitelistCIDR};`
  },

  _validateCIDR(input, answers) {
    const cidrRegex = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/(1[6-9]|2[0-8])$/);
    input = input.trim();

    if (!cidrRegex.test(input)) {
      return "Please enter a valid CIDR Block. The netmask must be between 16 and 28.";
    }

    const pass = (answers.newVPCCIDR !== input && answers.existingSubnetCIDR !== input && answers.whitelistCIDR !== input);
    return (pass) ? true : "This CIDR Block was previously assigned. Please enter a different CIDR Block";
  },
}

exports.prompts = prompts;

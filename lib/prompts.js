const inquirer = require("inquirer");
const { getVPCIds, getVPCSubnets } = require('./aws');

const prompts = {
  displayHelp() {
    const message = `Lodge is a framework for standing up your own ELK stack on AWS.\nRun 'lodge init' to get started.`;
    console.log(message);
  },

  async init() {
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
    const vpcs = await getVPCIds();
    let selectedVpc, subnets, filteredSubnets;
    const questions = [
      {
        type: "list",
        name: "deployment",
        message: "Please choose how you wish to install Lodge:",
        choices: ["Use an existing VPC", "Spin up a new VPC"],
      },
      {
        type: "list",
        name: "vpc",
        message: "Please choose the VPC you wish to deploy to",
        choices: () => vpcs.map(vpc => `ID: ${vpc.id} --- CIDR: ${vpc.cidr}`),
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "list",
        name: "subnet1",
        message: "We will need three subnets across three availability zones in this VPC. Please choose the id of the first subnet you wish to deploy in",
        choices: (answers) => {
          selectedVpc = vpcs.filter(vpc => vpc.id === answers.vpc.split(' --- ')[0].slice(4))[0];
          subnets = getVPCSubnets(selectedVpc.id);
          return subnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "list",
        name: "subnet2",
        message: "Please choose the id of the second subnet you wish to deploy in",
        choices: (answers) => {
          filteredSubnets = subnets;
          filteredSubnets = filteredSubnets.filter(subnet => subnet.id !== answers.subnet1.split(' --- ')[0].slice(4));
          return filteredSubnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "list",
        name: "subnet3",
        message: "Please choose the id of the third subnet you wish to deploy in",
        choices: (answers) => {
          filteredSubnets = filteredSubnets.filter(subnet => subnet.id !== answers.subnet2.split(' --- ')[0].slice(4));
          return filteredSubnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "input",
        name: "newVPCCIDR",
        message: "Enter a unique CIDR Block to deploy your new VPC in. It must not conflict with any of your existing VPCs",
        validate: this._validateCIDR,
        when: (answers) => answers.deployment === "Spin up a new VPC"
      },
      {
        type: "list",
        name: "userVPC",
        message: "Select the existing VPC you want to connect to your Lodge VPC",
        choices: vpcs.map(vpc => `ID: ${vpc.id} --- CIDR: ${vpc.cidr}`),
        validate: this._validateCIDR,
        when: (answers) => answers.deployment === "Spin up a new VPC"
      },
    ];

    
    let configConfirmed, answers, subnetIds, selectedSubnets;

    while (!configConfirmed) {
      answers = await inquirer.prompt(questions);
      subnetIds = [answers.subnet1, answers.subnet2, answers.subnet3].map(answer => answer.split(' --- ')[0].slice(4));
      selectedSubnets = subnets.filter(subnet => subnetIds.includes(subnet.id));

      const confirmation = await inquirer.prompt([
        {
          type: "confirm",
          name: "choice",
          message: this._confirmConfigMessage(answers),
        }
      ]);
      configConfirmed = confirmation.choice;
    }
    if (answers.deployment === "Use an existing VPC") {
      return {...answers, vpc: selectedVpc, subnets: selectedSubnets}
    } else {
      const userVPC = answers.userVPC.split(' --- ').map((elem, idx) => {
        if (idx === 0) {
          return elem.slice(4);
        } else {
          return elem.slice(6);
        }
      })
      return {...answers, userVPC: {id: userVPC[0], cidr: userVPC[1]}};
    }
  },

  _confirmConfigMessage(answers) {
    return (answers.deployment === "Use an existing VPC") ?
      `Is this correct? 
      Installation Type: ${answers.deployment}
      Subnet 1 => ${answers.subnet1}
      Subnet 2 => ${answers.subnet2}
      Subnet 3 => ${answers.subnet3}`
      :
      `Is this correct? 
      Installation Type => ${answers.deployment}
      Lodge VPC CIDR => ${answers.newVPCCIDR}
      User's VPC => ${answers.userVPC};`
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


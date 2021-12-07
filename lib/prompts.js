const inquirer = require("inquirer");
const { getVPCIds, getVPCSubnets } = require('./aws');

const prompts = {
  displayHelp() {
    const message = `Lodge is a framework for standing up your own ELK stack on AWS.\nRun 'lodge init' to get started.`;
    console.log(message);
  },

  async deploy() {
    console.clear();
    this._displayWelcome();
    await this._confirmAWSPrompt();
    return await this._configPrompt();
  },

  async destroy() {
    console.clear();
    await this._confirmDestroy();
    this._destroyPrompt();
    return true;
  },

  async _confirmDestroy() {
      const answer = await inquirer.prompt([{
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to destroy your Lodge stack?`,
      }]);

      if (!answer.confirm) process.exit();
    },

  _destroyPrompt() {
    console.log('Destroying stack...');
  },

  _displayWelcome() {
    console.log(`Welcome to Lodge!\nLodge will be installed in the current directory.`);
  },

  async _confirmAWSPrompt() {
    console.log(`This installation assumes you already have the AWS CLI installed and configured in a region that supports at least 3 availability zones.`);

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
        message: "Please choose the VPC you wish to deploy to:",
        choices: () => vpcs.map(vpc => `ID: ${vpc.id} --- CIDR: ${vpc.cidr}`),
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "list",
        name: "publicSubnet",
        message: "Please choose a public subnet for your dashboards",
        choices: (answers) => {
          selectedVpc = vpcs.filter(vpc => vpc.id === answers.vpc.split(' --- ')[0].slice(4))[0];
          subnets = getVPCSubnets(selectedVpc.id);
          return subnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "list",
        name: "subnet1",
        message: "We will need three private subnets across three availability zones in this VPC. Please choose the id of the first private subnet you wish to deploy in",
        choices: (answers) => {
          filteredSubnets = subnets;
          filteredSubnets = filteredSubnets.filter(subnet => subnet.id !== answers.publicSubnet.split(' --- ')[0].slice(4));
          return filteredSubnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "list",
        name: "subnet2",
        message: "Please choose the id of the second private subnet you wish to deploy in",
        choices: (answers) => {
          filteredSubnets = filteredSubnets.filter(subnet => subnet.id !== answers.subnet1.split(' --- ')[0].slice(4));
          return filteredSubnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        when: (answers) => answers.deployment === "Use an existing VPC"
      },
      {
        type: "list",
        name: "subnet3",
        message: "Please choose the id of the third private subnet you wish to deploy in",
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
    ];

    
    let configConfirmed, answers, subnetIds, selectedSubnets, selectedPrivateSubnet;
    
    while (!configConfirmed) {
      answers = await inquirer.prompt(questions);
      if (answers.deployment === "Use an existing VPC") {
        selectedPrivateSubnet = subnets.find(subnet => subnet.id === answers.publicSubnet.split(' --- ')[0].slice(4));
        subnetIds = [answers.publicSubnet, answers.subnet1, answers.subnet2, answers.subnet3].map(answer => answer.split(' --- ')[0].slice(4));
        selectedSubnets = subnets.filter(subnet => subnetIds.includes(subnet.id));
      }

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
      return {
        ...answers, 
        vpc: selectedVpc, 
        subnets: selectedSubnets, 
        privateSubnet: {
          id: selectedPrivateSubnet.id, 
          az: selectedPrivateSubnet.az
        }
      }
    } else {
      return answers;
    }
  },

  _confirmConfigMessage(answers) {
    return (answers.deployment === "Use an existing VPC") ?
      `Is this correct? 
      Installation Type: ${answers.deployment}
      Public Subnet => ${answers.publicSubnet}
      Subnet 1 => ${answers.subnet1}
      Subnet 2 => ${answers.subnet2}
      Subnet 3 => ${answers.subnet3}`
      :
      `Is this correct? 
      Installation Type => ${answers.deployment}
      Lodge VPC CIDR => ${answers.newVPCCIDR}`
  },

  _validateCIDR(input, answers) {
    const cidrRegex = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/(1[6-9]|2[0-8])$/);
    input = input.trim();

    if (!cidrRegex.test(input)) {
      return "Please enter a valid CIDR Block. The netmask must be between 16 and 28.";
    }

    const pass = (answers.newVPCCIDR !== input && answers.existingSubnetCIDR !== input);
    return (pass) ? true : "This CIDR Block was previously assigned. Please enter a different CIDR Block";
  },
}

exports.prompts = prompts;


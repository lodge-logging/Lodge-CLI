const inquirer = require("inquirer");
const { getVPCIds, getVPCSubnets } = require('../aws');
const { EXISTING_VPC, NEW_VPC } = require('../constants');

const uniqueAZs = [];

const prompts = {
  
  async deploy() {
    console.clear();
    return await this._configPrompt();
  },

  async _configPrompt() {
    const vpcs = await getVPCIds();
    let selectedVpc, subnets, filteredSubnets;
    const questions = [
      {
        type: "list",
        name: "deployment",
        message: "Please choose how you wish to install Lodge:",
        choices: [EXISTING_VPC, NEW_VPC],
      },
      {
        type: "list",
        name: "vpc",
        message: "Please choose the VPC you wish to deploy to:",
        choices: () => vpcs.map(vpc => `ID: ${vpc.id} --- CIDR: ${vpc.cidr}`),
        when: (answers) => answers.deployment === EXISTING_VPC
      },
      {
        type: "list",
        name: "publicSubnet",
        message: "Please choose a public subnet for your dashboards",
        choices: async (answers) => {
          selectedVpc = vpcs.filter(vpc => vpc.id === answers.vpc.split(' --- ')[0].slice(4))[0];
          subnets = await getVPCSubnets(selectedVpc.id);
          console.log(subnets.length);
          return subnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        when: (answers) => answers.deployment === EXISTING_VPC
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
        validate: this._validateAZs,
        when: (answers) => answers.deployment === EXISTING_VPC
      },
      {
        type: "list",
        name: "subnet2",
        message: "Please choose the id of the second private subnet you wish to deploy in",
        choices: (answers) => {
          filteredSubnets = filteredSubnets.filter(subnet => subnet.id !== answers.subnet1.split(' --- ')[0].slice(4));
          return filteredSubnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        validate: this._validateAZs,
        when: (answers) => answers.deployment === EXISTING_VPC
      },
      {
        type: "list",
        name: "subnet3",
        message: "Please choose the id of the third private subnet you wish to deploy in",
        choices: (answers) => {
          filteredSubnets = filteredSubnets.filter(subnet => subnet.id !== answers.subnet2.split(' --- ')[0].slice(4));
          return filteredSubnets.map(subnet => `ID: ${subnet.id} --- CIDR: ${subnet.cidr} --- AZ: ${subnet.az} --- FreeIPs: ${subnet.freeIpCount}`);
        },
        validate: this._validateAZs,
        when: (answers) => answers.deployment === EXISTING_VPC
      },
      {
        type: "input",
        name: "lodgeCidr",
        message: "Enter a unique CIDR Block to deploy your new VPC in. It must not conflict with any of your existing VPCs",
        validate: this._validateCIDR,
        when: (answers) => answers.deployment === NEW_VPC
      },
      {
        type: "input",
        name: "userCidr",
        default: '0.0.0.0/0',
        message: "Enter a unique CIDR Block to restrict traffic to your dashboard. Default is 0.0.0.0/0 (not recommended)",
        validate: this._validateUserCIDR,
        when: () => true
      },
    ];

    
    let configConfirmed, answers, selectedPrivateSubnetIds, selectedPrivateSubnets, selectedPublicSubnet;
    
    while (!configConfirmed) {
      answers = await inquirer.prompt(questions);
      if (answers.deployment === EXISTING_VPC) {
        selectedPublicSubnet = subnets.find(subnet => subnet.id === answers.publicSubnet.split(' --- ')[0].slice(4));
        selectedPrivateSubnetIds = [answers.subnet1, answers.subnet2, answers.subnet3].map(answer => answer.split(' --- ')[0].slice(4));
        selectedPrivateSubnets = subnets.filter(subnet => selectedPrivateSubnetIds.includes(subnet.id));
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
    if (answers.deployment === EXISTING_VPC) {
      return {
        ...answers, 
        lodgeVpc: selectedVpc, 
        privateSubnets: selectedPrivateSubnets, 
        publicSubnet: {
          id: selectedPublicSubnet.id, 
          az: selectedPublicSubnet.az
        }
      }
    } else {
      return {...answers, lodgeVpc: {id: '', cidr: answers.lodgeCidr}};
    }
  },

  _confirmConfigMessage(answers) {
    return (answers.deployment === EXISTING_VPC) ?
      `Is this correct? 
      Installation Type: ${answers.deployment}
      Public Subnet => ${answers.publicSubnet}
      Subnet 1 => ${answers.subnet1}
      Subnet 2 => ${answers.subnet2}
      Subnet 3 => ${answers.subnet3}
      User CIDR => ${answers.userCidr}`
      :
      `Is this correct? 
      Installation Type => ${answers.deployment}
      Lodge VPC CIDR => ${answers.lodgeCidr}
      User CIDR => ${answers.userCidr}`
  },

  _validateCIDR(input, answers) {
    const cidrRegex = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/(1[6-9]|2[0-8])$/);
    input = input.trim();

    if (!cidrRegex.test(input)) {
      return "Please enter a valid CIDR Block. The netmask must be between 16 and 28.";
    }

    const pass = (answers.lodgeCidr !== input && answers.userCidr !== input);
    return (pass) ? true : "This CIDR Block was previously assigned. Please enter a different CIDR Block";
  },
  _validateUserCIDR(input, answers) {
    const cidrRegex = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|1[0-9]|2[0-9]|3[0-2])$/);
    input = input.trim();

    if (!cidrRegex.test(input)) {
      return "Please enter a valid CIDR Block.";
    }

    const pass = (answers.lodgeCidr !== input && answers.userCidr !== input);
    return (pass) ? true : "This CIDR Block was previously assigned. Please enter a different CIDR Block";
  },
  _validateAZs(choice) {
    const az = choice.split(' --- ')[2].slice(4);
    if (!uniqueAZs.includes(az)) {
      uniqueAZs.push(az);
      return true;
    } else {
      return "This availability zone has already been taken by another private subnet. Please choose a different subnet."
    }
  }
}

exports.prompts = prompts;


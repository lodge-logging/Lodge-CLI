const { execSync, exec } = require("child_process");
const { COMMANDS } = require('../lib/constants');

const options = {stdio : 'pipe' };

async function getVPCIds() {
  try {
    const vpcs = execSync(COMMANDS.GET_VPCS, options);
    return JSON.parse(vpcs).Vpcs.map(vpc => {
      return {id: vpc.VpcId, cidr: vpc.CidrBlock}
    });
  } catch (error) {
    console.error(error);
  }
  
}

async function getVPCSubnets(vpcId) {
  try {
    const getSubnetCommand = `${COMMANDS.GET_SUBNETS} "Name=vpc-id,Values=${vpcId}"`;
    const subnets = execSync(getSubnetCommand, options);

    return JSON.parse(subnets).Subnets.map(subnet => {
      return {
        id: subnet.SubnetId,
        cidr: subnet.CidrBlock,
        az: subnet.AvailabilityZone,
        freeIpCount: subnet.AvailableIpAddressCount
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function checkIp(ip) {
  try {
    return JSON.parse(
      execSync(
        `aws ec2 describe-network-interfaces --filters Name=addresses.private-ip-address,Values=${ip}`,
        options
      )
    );
  } catch (error) {
    console.error(error);
  }
}

async function checkGlobalInstall(args) {
  if (Array.isArray(args)) {
    args.forEach(arg => {
      try {
        execSync(`${arg} --version`, options);
      } catch (error) {
        console.error(`"${arg}" command is not available. Please install "${arg}" globally to use Lodge CLI`);
      }
    });
  } else {
    execSync(`${args} --version`, options);
  }
}

module.exports = { getVPCIds, getVPCSubnets, checkIp, checkGlobalInstall };
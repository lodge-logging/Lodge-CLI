const sh = require("shelljs");

function getSubnetCidr(config) {
  const getSubnetCommand = `aws ec2 describe-subnets --filters "Name=subnet-id,Values=${config.subnetId1},${config.subnetId2},${config.subnetId3}"`;
  // get 
}

function getVPCIds() {
  const getVPCsCommand = `aws ec2 describe-vpcs`;
  const vpcs = sh.exec(getVPCsCommand).stdout; // get the json response
  // return vpc IDs as an array.
  return JSON.parse(vpcs).Vpcs.map(vpc => {
    return {id: vpc.VpcId, cidr: vpc.CidrBlock}
  });
}

function getVPCSubnets(vpcId) {
  const getSubnetCommand = `aws ec2 describe-subnets --filters "Name=vpc-id,Values=${vpcId}"`;
  const subnets = sh.exec(getSubnetCommand).stdout;
  // return subnet Ids as a list. 
  return JSON.parse(subnets).Subnets.map(subnet => {
    return {
      id: subnet.SubnetId,
      cidr: subnet.CidrBlock,
      az: subnet.AvailabilityZone,
      freeIpCount: subnet.AvailableIpAddressCount
    }
  });
}

const vpcs = getVPCIds();
const selectedVpc = vpcs[0];
console.log(getVPCSubnets(selectedVpc.id));

exports.awsCommands = { getVPCIds, getVPCSubnets };
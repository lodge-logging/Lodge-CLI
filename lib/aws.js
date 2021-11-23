const sh = require("shelljs");

function getSubnetCidr(config) {
  const getSubnetCommand = `aws ec2 describe-subnets --filters "Name=subnet-id,Values=${config.subnetId1},${config.subnetId2},${config.subnetId3}"`;
  // get 
}

function getVPCIds() {
  const getVPCsCommand = `aws ec2 describe-vpcs --filters"`;
  sh.exec(getVPCsCommand); // get the json response
  // return vpc IDs as an array.
}

function getVPCSubnets(vpcId) {
  const getSubnetCommand = `aws ec2 describe-subnets --filters "Name=vpc-id,Values=${vpcId}"`;
  sh.exec(getSubnetCommand);
  // return subnet Ids as a list. 
}

exports.awsCommands = { getVPCIds, getVPCSubnets };
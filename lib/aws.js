const { execSync } = require("child_process");
// function getSubnetCidr(config) {
//   const getSubnetCommand = `aws ec2 describe-subnets --filters "Name=subnet-id,Values=${config.subnetId1},${config.subnetId2},${config.subnetId3}"`;
//   // get 
// }
const options = {stdio : 'pipe' };

function getVPCIds() {
  const getVPCsCommand = `aws ec2 describe-vpcs`;
  const vpcs = execSync(getVPCsCommand, options); // get the json response
  // return vpc IDs as an array.
  return JSON.parse(vpcs).Vpcs.map(vpc => {
    return {id: vpc.VpcId, cidr: vpc.CidrBlock}
  });
}

function getVPCSubnets(vpcId) {
  const getSubnetCommand = `aws ec2 describe-subnets --filters "Name=vpc-id,Values=${vpcId}"`;
  const subnets = execSync(getSubnetCommand, options);
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

function checkIp(ip) {
  return JSON.parse(
    execSync(
      `aws ec2 describe-network-interfaces --filters Name=addresses.private-ip-address,Values=${ip}`,
      options
    )
  );
}

getVPCSubnets('vpc-09a30b265c9d345bc');
module.exports = { getVPCIds, getVPCSubnets, checkIp };
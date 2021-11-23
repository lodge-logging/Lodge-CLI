const { getLastIp } = require('./getLastIp');
const { checkIp } = require('../aws');

function getIps(subnets) {
  const ips = [];
  subnets.forEach((subnet, idx) => {
    const octets = getLastIp(subnet.cidr);
    const iterable = subnet.cidr.split('/')[0].split('.');
    for (let index = iterable.length - 1; ips.length < idx + 1; index--) {
      for (let start = 4; start < octets[index]; start++) {
        iterable[index] = start;
        const currentIP = iterable.join('.');
        const options = {stdio : 'pipe' };
        const res = checkIp(currentIP);
        if (res.NetworkInterfaces.length) {
          continue;
        } else {
          ips.push(currentIP);
          break;
        } 
      }
    }
  });

  return ips;
}

module.exports = { getIps };

// aws ec2 get-subnet-cidr-reservations --subnet-id subnet-023aea76c08ec1244
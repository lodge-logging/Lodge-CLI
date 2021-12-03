const { getLastIp } = require('./getLastIp');
const { checkIp } = require('../aws');

function getIps(subnets) {
  const ips = [];
  subnets.forEach((subnet, idx) => {
    const octets = getLastIp(subnet.cidr);
    const iterable = subnet.cidr.split('/')[0].split('.');
    for (let index = iterable.length - 1; ips.length < idx + 1; index--) {
      for (let start = iterable[index]; start < octets[index]; start++) {  
        iterable[index] = start;
        if (index === iterable.length - 1) {
          if (start === '0' || start === 1 || start === 2 || start === 3 || start === 255) continue;
        }
        const currentIP = iterable.join('.');
        const res = checkIp(currentIP);
        if (res.NetworkInterfaces.length) {
          continue;
        } else {
          ips.push({id: subnet.id, ip: currentIP});
          break;
        } 
      }
    }
  });

  return { subnetA: ips[0], subnetB: ips[1], subnetC: ips[2] };
}

module.exports = { getIps };

// aws ec2 get-subnet-cidr-reservations --subnet-id subnet-023aea76c08ec1244
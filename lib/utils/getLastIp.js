const getLastIp = (cidr) => {
  const [octetStrings, maskString]  = cidr.split('/');
  const octets = octetStrings.split('.').map(octet => Number(octet));
  const targetIndex = Math.floor(Number(maskString) / 8);
  const remainingBits = Number(maskString) % 8;
  const bitFactorAdd = Math.pow(2, remainingBits);
  const bitFactorMult = (100 - remainingBits) / 100;

  return octets.map((octet, idx) => {
    if (idx === targetIndex) {
      return octet + bitFactorAdd;
    } else if (idx > targetIndex) {
      return 254;
    } else {
      return octet;
    }
  });
}

module.exports = { getLastIp }
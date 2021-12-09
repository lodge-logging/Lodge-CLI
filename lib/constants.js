module.exports = {
  EXISTING_VPC: "Use an existing VPC",
  NEW_VPC: "Spin up a new VPC",
  OUTPUT_FILE: 'outputs.json',
  COMMANDS: {
    DEPLOY: 'cdk deploy --all --outputs-file',
    DESTROY: 'cdk destroy --all --force',
    CONNECT: 'aws ssm start-session --target',
    DELETE_KEY: 'aws ec2 delete-key-pair --key-name',
    CREATE_KEY: 'aws ec2 create-key-pair --key-name',
    GET_VPCS: 'aws ec2 describe-vpcs',
    GET_SUBNETS: 'aws ec2 describe-subnets --filters',
    GET_AZS: 'aws ec2 describe-availability-zones',
  },
  APP_NAME: 'lodge-app',
  REPO: 'https://github.com/lodge-logging/Lodge.git',
  KEY_NAME: 'lodge-key',
  KEY_PATH: 'bin/lodge-key.pem',
  CONTEXT_PATH: 'user-data.json',
  CONTEXT: {
    privateSubnets: {
      subnetA: {
        id: '',
        cidr: '',
        az: ''
      },
      subnetB: {
        id: '',
        cidr: '',
        az: ''
      },
      subnetC: {
        id: '',
        cidr: '',
        az: ''
      }
    },
    publicSubnet: { id: '', az: '' },
    lodgeVpc: { id: '', cidr: '' },
    userCidr: ''
  },
}
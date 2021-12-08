#!/usr/bin/env node

const { init, deploy, help, connect, destroy } = require('../src/main');

const command = process.argv[2];

switch (command) {
  case 'init':
    init(process.argv);
    break;
  case 'deploy':
    deploy(process.argv);
    break;
  case 'help':
    help(process.argv);
    break;
  case 'connect':
    connect(process.argv);
    break;
  case 'destroy':
    destroy(process.argv);
    break;
}


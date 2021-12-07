#!/usr/bin/env node

const connect = require("../src/connect");
const help = require("../src/help");
const init = require("../src/init");
const destroy = require('../src/destroy');
const deploy = require('../src/deploy');

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


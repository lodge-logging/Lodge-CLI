#!/usr/bin/env node

const connect = require("../src/connect");
const help = require("../src/help");
const init = require("../src/init");

const command = process.argv[2];

switch (command) {
  case 'init':
    init(process.argv);
  case 'help':
    help(process.argv);
  case 'connect':
    connect(process.argv);
}


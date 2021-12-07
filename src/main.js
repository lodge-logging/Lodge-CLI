#!/usr/bin/env node

const init = require('./init');
const deploy = require('./deploy');
const help = require('./help');
const connect = require('./connect');
const destroy = require('./destroy');

module.exports = {init, help, connect, destroy, deploy};
#!/usr/bin/env node

const path = require('path');
const chalk = require("chalk");
const phabricatorApi = require('./src/phabricator/index');
const releaseApp = require('./src/apps/releases');
// const iterationApp = require('./src/apps/iterations');
const minimist = require('minimist');
const platform = require('./src/phabricator/platform');
const api = {
  releases: releaseApp,
  // iterations: iterationApp
};
const configLoader = require('./src/config');

const readConfig = (filename) => {
  const file = path.resolve(process.cwd(), filename);
  configLoader.loadFile(file);
  return configLoader;
}; 

const run = async () => {
  // argv._[0] => app e.g. releases
  // argv._[1] => action e.g. create
  let argv = minimist(process.argv.slice(2));
  let application = null;
  const config = readConfig(argv.c || './fakerito.config.json');
  let result = null;

  await phabricatorApi.connect({
    api: argv.api,
    token: argv.token
  });

  if (api.hasOwnProperty(argv._[0])) {
    platform.createPlatform(config);
    application = api[argv._[0]];

    result = application[argv._[1]](argv, config.getProperties());
    
    if (result.error) {
      console.warn(chalk.red(result.message));
    } else {
      console.info(chalk.green(result.message));
    }
    
  } else {
    console.warn(chalk.red('Command not found:', argv._[0]));
  }
};

run();
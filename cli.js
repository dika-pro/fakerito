#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const chalk = require("chalk");
const phabricatorApi = require('./src/phabricator/index');
const releaseApp = require('./src/apps/releases');
const minimist = require('minimist');
const platform = require('./src/phabricator/platform');
const api = {
  releases: releaseApp
};

const readConfig = (filename) => {
  const file = path.resolve(process.cwd(), filename);
  let json = null;

  try {
    json = JSON.parse(fs.readFileSync(file).toString());
  } catch (error) {
    console.info(chalk.red('Error reading configuration file!'));
    process.exit(2);
  }

  return json;
}; 

const run = async () => {
  // argv._[0] => app e.g. releases
  // argv._[1] => action e.g. create
  let argv = minimist(process.argv.slice(2));
  const config = readConfig(argv.c || './fakerito.config.json');

  await phabricatorApi.connect();

  if (api.hasOwnProperty(argv._[0])) {
    platform.createPlatform(config);
    api[argv._[0]]({
      argv, 
      config
    });
  } else {
    console.warn(chalk.red('App not found:', argv._[0]));
  }
 
};

run();
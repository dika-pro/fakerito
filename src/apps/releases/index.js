
const chalk = require("chalk");
const phabricatorApi = require('../../phabricator/index');
const phabricatorUsers = require('../../phabricator/users/users');
const _  = require('lodash');
const ReleaseTask = require('./models/releaseTaskModel');
const releaseNotesView = require('./views/releaseNotes');
const platform = require('../../phabricator/platform');

function help() {
  const usageText = `
  release helps you manage you release process.

  usage:
    release <command>

    commands can be:

    create:      used to create a new release board
                 
                 --dry-run 

    create-release-notes:      used to create release notes from active release
                --dry-run 
                --draft 
                
    resolve:     resolve active release
    history:     list last 5 releases
    help:        print the usage guide
  `;

  console.log(usageText)
}

/**
 * 
 * @param {Object} params 
 * @param {String} params.c - path to config file in json format
 * @param {String} params.draft - is document in draft state. If yes it will not add #software_release tag yet
 */
async function createRelease(params, config) {
    let milestoneResponse = null;
    const currentPlatform = platform.getPlatform();
    let releaseTask = new ReleaseTask({
      config,
      platform: currentPlatform
    });
    await releaseTask.fetchPhabData();

    if (!params['dry-run']) {
      // releaseTask.createEvent(69563);
      milestoneResponse = releaseTask.createMilestone();
      console.info(chalk.green(`Sucessfuly created milestone (${currentPlatform.getConfig('url')}/project/view/${milestoneResponse.object.id}).`));
    } else {

    }
}

async function resolveRelease(params, config) {
  const currentPlatform = platform.getPlatform();
  let releaseTask = new ReleaseTask({
    config,
    platform: currentPlatform
  });
  releaseTask.fetchPhabData();
  releaseTask.resolveRelease();
};

async function history(params, config) {
  const tasksResponse = await phabricatorApi.exec('maniphest.search', {
    constraints: {
      projects: [
        config.projectTag,
        'software_release'
      ]
    },
    order: 'newest',
    limit: 5
  });

  tasksResponse.data.forEach((task) => {
    if (task.fields.status.value === 'open') {
      console.log(chalk.green(task.fields.name));
    } else {
      console.log(chalk.yellow(task.fields.name));
    }
  });
}

async function createReleaseNotes(params, config) {
  const currentPlatform = platform.getPlatform();
  let releaseTask = new ReleaseTask({
    config,
    platform: currentPlatform
  });
  let response = null;
  const releaseConfig = config.releases[0];
  const owner = await phabricatorUsers.getUsersByUsernames([releaseConfig.owner]);
  const subscribes = await phabricatorUsers.getUsersByUsernames(releaseConfig.subscribers);
  let description;
  let title = `[RELEASE] ${config.projectName} - ${releaseConfig.nextVersion} - ${releaseConfig.releaseDate}`;
  let taskPayload = {
    transactions:  [
      {
        type: 'owner',
        value: owner.data[0].phid
      },
      {
        type: 'subscribers.add',
        value: _.map(subscribes.data, 'phid')
      },
      {
        type: currentPlatform.getConfig('task.customFields.slack'),
        value: config.slackChannel
      },
    ]
  };
  let projects = [...releaseConfig.projects, config.projectTag, `release_${releaseConfig.nextVersion}`];
  await releaseTask.fetchPhabData();
  description = releaseNotesView.genereateReleaseReport({
    releaseTask: releaseTask,
    config: config
  });

  taskPayload.transactions.push({
    type: 'description',
    value: description
  }); 

   // if this is not draft document add release tag
   if (!params.draft) {
    projects.push('software_release');
  } else {
    // add draft to end of title
    title += ' - DRAFT'
  }

  taskPayload.transactions.push({
    type: 'title',
    value: title
  }); 

  taskPayload.transactions.push({
    type: 'projects.add',
    value: projects
  }); 

  if (!params['dry-run']) {
    response = await releaseTask.createOrUpdate(taskPayload);
    console.info(chalk.green(`Sucessfuly created release notes (${currentPlatform.getConfig('url')}/T${response.object.id}).`));
  } else {
    console.info(chalk.green(`Possibe task payload:`));
    console.info(JSON.stringify(taskPayload));
  }
}

const api = {
  create: createRelease,
  resolve: resolveRelease,
  history: history,
  help: help,
  'create-release-notes': createReleaseNotes
}

module.exports = function(params) {
  const argv = params.argv;
  const config = params.config;
  api[argv._[1]](argv, config);
}
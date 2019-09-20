
const chalk = require("chalk");
const phabricatorApi = require('../../phabricator/index');
const phabricatorUsers = require('../../phabricator/users/users');
const _  = require('lodash');
const ReleaseTask = require('./models/releaseTaskModel');
const releaseNotesView = require('./views/releaseNotes');
const platform = require('../../phabricator/platform');

function help() {
  const usageText = `
  Release helps you manage you release process.

  usage:
    release <command>

    commands can be:

    create:      used to create a new release board under {$projectTag}
                 
                 --dry-run 

    generate-release-notes:      used to create or update release notes for current release
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
      releaseTask.createEvent(69563);
      milestoneResponse = releaseTask.createMilestone();
      console.log(currentPlatform);
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
  await releaseTask.fetchPhabData();
  await releaseTask.resolveRelease();
};

async function history(params, config) {
  const tasksResponse = await phabricatorApi.exec('maniphest.search', {
    constraints: {
      projects: [
        'software_release',
        config.get('projectTag')
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

async function generateReleaseNotes(params, config) {
  const currentPlatform = platform.getPlatform();
  let releaseTask = new ReleaseTask({
    config,
    platform: currentPlatform
  });
  let response = null;
  const releaseConfig = config.get('releases')[0];
  const owner = await phabricatorUsers.getUsersByUsernames([releaseConfig.owner]);
  const subscribes = await phabricatorUsers.getUsersByUsernames(releaseConfig.subscribers);
  let description;
  let title = `[RELEASE] ${config.get('projectName')} - ${releaseConfig.nextVersion} - ${releaseConfig.releaseDate}`;
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
        value: config.get('slackChannel')
      },
    ]
  };

  let projects = [...releaseConfig.projects, config.get('projectTag'), releaseTask.getReleaseTag()];
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
  'generate-release-notes': generateReleaseNotes
}

module.exports = function(params) {
  const argv = params.argv;
  const config = params.config;
  api[argv._[1]](argv, config);
}
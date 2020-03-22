const _  = require('lodash');
const moment = require('moment');
const chalk = require("chalk");
const phabricatorApi = require('../../../phabricator/index');
const phabricatorUsers = require('../../../phabricator/users/users');
const Task = require('./taskModel');

function ReleaseTask (params) {
    this.config = params.config;
    this.phabTask = null;
    this.phabOwner = null;
    this.phabSubscribers = null;
    this.phabProject = null;
    this.phabPreviousReleseTask = null;
    this.phabReleaseTasks = null;
    this.platform = params.platform;
}

ReleaseTask.prototype.setData = function(config) {
    this.config = config;
}

ReleaseTask.prototype.fetchPhabData = async function() {
    const releaseConfig = this.config;
    this.phabTask = await phabricatorApi.exec('maniphest.search', {
        constraints: {
          query: `title:${this.getName()}`
        }
    });
    this.phabProject = await phabricatorApi.exec('project.search', {
        constraints: {
            query: `title:${this.config.projectTag}`
        }
    });
    this.phabOwner = await phabricatorUsers.getUsersByUsernames([releaseConfig.owner]);

    this.phabSubscribers = await phabricatorUsers.getUsersByUsernames(releaseConfig.subscribers)
    this.phabPreviousReleseTask = await phabricatorApi.exec('maniphest.search', {
        constraints: {
          query: `title:[RELEASE] ${this.config.projectName} \\- ${releaseConfig.previousVersion}`
        }
    });
    this.phabReleaseTasks = await phabricatorApi.exec('maniphest.search', {
        constraints: {
          projects: [
            this.config.projectTag,
            this.getReleaseTag()
          ]
        },
        attachments: {
            projects: true
        },
        order: 'priority',
    });
}

ReleaseTask.prototype.getTasks = function() {
    return this.phabReleaseTasks.data.map(task => {
        return new Task(task);
    });
}

ReleaseTask.prototype.getFullStartDateAsString = function() {
    return`${this.config.releaseDate} ${this.config.releaseTimeFrom}`;
}

ReleaseTask.prototype.getFullEndDateAsString = function() {
    return `${this.config.releaseDate} ${this.config.releaseTimeTo}`;
}

ReleaseTask.prototype.getName = function() {
    return `[RELEASE] ${this.config.projectName} \\- ${this.config.nextVersion} \\- ${this.config.releaseDate}`;
}

ReleaseTask.prototype.getDisplayName = function() {
    return `[RELEASE] ${this.config.projectName} - ${this.config.nextVersion} - ${this.config.releaseDate}`;
}

ReleaseTask.prototype.resolveRelease = async function() {
    let editResponse;
    if (this.phabTask.data.length) {
        editResponse = await phabricatorApi.exec('maniphest.edit', {
          transactions: [
            {
              type: 'status',
              value: 'resolved'
            }
          ],
          objectIdentifier: `T${this.phabTask.data[0].id}`
        });
        console.log(chalk.green(`Task resolved sucessfuly. (${this.platform.getConfig('url')}/T${editResponse.object.id})`));
    } else {
        console.log(chalk.yellow('Active resolve task not found'));
    }
}

ReleaseTask.prototype.createEvent = async function(taskId) {
    let eventPayload = {
        transactions:  [
            {
              type: 'name',
              value: this.getDisplayName()
            },
            {
                type: 'hostPHID',
                value: this.phabOwner.data[0].phid
            },
            {
                type: 'start',
                value: 1483228800
            },
            {
                type: 'end',
                value: 1493228800
            },
            {
                type: 'inviteePHIDs',
                value: _.map(this.phabSubscribers.data, 'phid')
            },
            {
                type: 'projects.add',
                value: [...this.config.projects, this.config.projectTag, 'software_release']
            },
            {
                type: 'description',
                value: `{T${taskId}}`
            }
        ]
    };

    return await phabricatorApi.exec('calendar.event.edit', eventPayload);
}

ReleaseTask.prototype.createMilestone = async function() {
    let milestonePayload = {
        transactions:  [
            {
                type: 'milestone',
                value: this.phabProject.data[0].phid
            },
            {
                type: 'name',
                value: `[RELEASE] ${this.config.nextVersion} - ${this.config.releaseDate}`
            },
            {
                type: 'slugs',
                value: [`${this.config.projectTag}_${this.config.nextVersion}`]
            }
        ]
    };

    return await phabricatorApi.exec('project.edit', milestonePayload);
}

ReleaseTask.prototype.createOrUpdate = async function(taskPayload) {
    if (this.phabTask.data.length) {
        taskPayload.objectIdentifier = `T${this.phabTask.data[0].id}`;
    }
    return await phabricatorApi.exec('maniphest.edit', taskPayload);
}

ReleaseTask.prototype.addDataToCustomFields = async function(taskPayload) {
    if (this.phabTask.data) {
        taskPayload.objectIdentifier = `T${this.phabTask.data[0].id}`;
    }
    return await phabricatorApi.exec('maniphest.edit', taskPayload);
}

ReleaseTask.prototype.getReleaseTag = function() {
   return `release_${this.config.nextVersion}`;
}

module.exports = ReleaseTask;
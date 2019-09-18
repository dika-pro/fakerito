const showdown  = require('showdown');
const jsdom = require("jsdom");
const _ = require('lodash');
const TASK_META_STATUSES =  require('../../../phabricator/tasks/TASK_META_STATUSES');

function genereateReleaseReport(data) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM();
    const converter = new showdown.Converter();
    const { config, releaseTask } = data;
    const releaseConfig = config.get('releases')[0];
    const previousReleseTask = releaseTask.phabPreviousReleseTask;
    const tasks = releaseTask.getTasks();
    const legendDesc = _.map(TASK_META_STATUSES.api, (value) => {
      return `{icon ${value.ICON}} - ${value.DESCRIPTION}`;
    }).join(', ');

    let final = '';
    if (releaseTask.phabTask) {
      // we are editing alredy created release task 
    }

    final += `<p>Release Date: <b>${releaseConfig.releaseDate} ${releaseConfig.releaseTimeFrom} - ${releaseConfig.releaseTimeTo}</b></p>`;
    
    if (previousReleseTask.data.length) {
      final += `<p>Previous release task: {T${previousReleseTask.data[0].id}}</p>`;
    }

    final += `<h2>CHANGELOG</h2>`;
    if (tasks.length) {
      final += `<ul>`;
      tasks.forEach((task) => {
        let flags = '';

        flags +=  task.getTaskMetaFlagIcon(TASK_META_STATUSES.IS_VISIBLE_TO_CLIENT);
        flags +=  task.getTaskMetaFlagIcon(TASK_META_STATUSES.HAS_DOWNTIME);
        flags +=  task.getTaskMetaFlagIcon(TASK_META_STATUSES.IS_PATCH);

        if (task.getCallSign() !== '[RELEASE]') {
          final += `<li>${task.getNameShort()}(T${task.getId()}) ${flags}</li>`;
        }
      });
      final += `</ul>`;
      final += `<p>${legendDesc}</p>`;
      final += `<hr>`;
    }

    if (releaseConfig.additionalInfo) {
      releaseConfig.additionalInfo.forEach((info) => {
        final += `<h3>${info.title}</h3>`;
        final += `<ul>`;
        info.entries.forEach((entry) => {
          final += `<li>${entry.value}</li>`;
        });
        final += `</ul>`;
        final += `<hr>`;
      }); 
    }

    return converter.makeMarkdown(final, dom.window.document)
        .replace(/<\!--.*?-->/g, " ");
}

module.exports = {
    genereateReleaseReport: genereateReleaseReport
}
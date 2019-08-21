const showdown  = require('showdown');
const jsdom = require("jsdom");

function genereateReleaseReport(data) {
    const { JSDOM } = jsdom;
    const dom = new JSDOM();
    const converter = new showdown.Converter();
    const { config, releaseTask } = data;
    const releaseConfig = config.get('releases')[0];
    const previousReleseTask = releaseTask.phabPreviousReleseTask;
    const tasks = releaseTask.getTasks();

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

        flags += task.isVisibleToClient();
        flags += task.hasDowntime();

        if (task.getCallSign() !== '[RELEASE]') {
          final += `<li>${task.getNameShort()}(T${task.getId()}) ${flags}</li>`;
        }
      });
      final += `</ul>`;
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
const TASK_META_STATUSES =  require('../../../phabricator/tasks/TASK_META_STATUSES');

function Task (data) {
    this.data = data;
}

Task.prototype.isVisibleToClient = function() {
    if (this.data.fields.description.raw.indexOf('**Visible to client:** Yes') >= 0) {
        return '{icon eye}';
    }
    return '';
}

Task.prototype.hasDowntime = function() {
    if (this.data.fields.description.raw.indexOf('**Downtime**: Yes') >= 0) {
        return '{icon arrow-circle-o-down}';
    }
    return '';
}

Task.prototype.getTaskMetaFlagIcon = function(flag) {
    const flagInstance = TASK_META_STATUSES.api[flag];
    if (flagInstance.positive({task: this})) {
        return `{icon ${flagInstance.ICON}}`;
    }

    return '';
}

Task.prototype.getCallSign = function() {
    return this.data.fields.name.split(/,?\s+/)[0];
}

Task.prototype.getNameShort = function() {
    // without getCallSign
    const nameDisambled = this.data.fields.name.split('-');
    // fix short name
    return nameDisambled[nameDisambled.length - 1];
}


Task.prototype.getId = function() {
    return this.data.id;
}

module.exports = Task;

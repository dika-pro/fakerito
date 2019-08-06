function Task (data) {
    this.data = data;
}

Task.prototype.isVisibleToClient = function() {
    if (this.data.fields.description.raw.indexOf('**Visible to client**: Yes') >= 0) {
        return '{icon eye}';
    }
    return '';
}

Task.prototype.hasDowntime = function() {
    if (this.data.fields.description.raw.indexOf('**Downtime**: Yes') >= 0) {
        return '{fa-thumbs-o-down}';
    }
    return '';
}


Task.prototype.getCallSign = function() {
    return this.data.fields.name.split('-')[0];
}

Task.prototype.getNameShort = function() {
    // without getCallSign
    const nameDisambled = this.data.fields.name.split('-');
    return nameDisambled[nameDisambled.length - 1];
}


Task.prototype.getId = function() {
    return this.data.fields.id;
}

module.exports = Task;

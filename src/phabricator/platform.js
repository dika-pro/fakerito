let currentPlatfrom = null;
const property = require('lodash/property');

function Phabricator (config) {
    this.config = config;
}

Phabricator.prototype.getConfig = function(key) {
    return property(key)(this.config);
}

module.exports = {
    createPlatform: function(config) {
        currentPlatfrom = new Phabricator(config.get('phabricator'));
    },
    getPlatform: function() {
        return currentPlatfrom;
    }
};

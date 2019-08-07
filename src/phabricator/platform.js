const property = require('lodash/property');
let currentPlatfrom = null;

function Phabricator (config) {
    this.config = config;
}

Phabricator.prototype.getConfig = function(key) {
   return property(key)(this.config);
}

module.exports = {
    createPlatform: function(config) {
        currentPlatfrom = new Phabricator(config.phabricator);
    },
    getPlatform: function() {
        return currentPlatfrom;
    }
};

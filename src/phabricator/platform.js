const property = require('lodash/property');
let currentPlatfrom = null;

function Phabricator (config) {
    this.config = config;
}

Phabricator.prototype.getConfig = function(key) {
   return this.config.get(key);
}

module.exports = {
    createPlatform: function(config) {
        currentPlatfrom = new Phabricator(config.get('phabricator'));
    },
    getPlatform: function() {
        return currentPlatfrom;
    }
};

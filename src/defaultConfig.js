var convict = require('convict');
 
// Define a schema
var config = convict({
  env: {
    doc: 'Set env.',
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV'
  },
  phabricator: {
    api: {
      doc: 'Phabricator API url.',
      format: 'url',  
      env: 'PHAB_API',
      arg: 'phab_api',
      default: undefined
    },
    token: {
      doc: 'Phabricator API token.',
      format: String, 
      env: 'PHAB_TOKEN',
      arg: 'phab_token' ,
      default: undefined
    },
    url: {
      doc: 'Phabricator URL.',
      format: String, 
      env: 'PHAB_URL',
      arg: 'phab_url' ,
      default: undefined
    },
    task: {
      customFields: {
        slack: {
          doc: 'Slack custom field.',
          format: String, 
          default: undefined
        }
      }
    }
  }
});
 
// Load environment dependent configuration
var env = config.get('env');

config.loadFile('./config/' + env + '.json');

// Perform validation
config.validate({allowed: 'strict'});
 
module.exports = config;
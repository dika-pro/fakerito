var convict = require('convict');
 
// Define a schema
var config = convict({
  env: {
    doc: 'Set env.',
    format: ['production', 'development'],
    default: 'development',
    env: 'NODE_ENV'
  },
  basic_username: {
    doc: 'Set api user.',
    format: String, 
    default: undefined,
    arg: 'basic_username',
    env: 'BASIC_USERNAME'
  },
  basic_password: {
    doc: 'Set api pass.',
    format: String, 
    default: undefined,
    arg: 'basic_password',
    env: 'BASIC_PASSWORD'
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
          env: 'SLACK_CUSTOM_FIELD',
          arg: 'slack_custom_field' ,
          default: undefined
        }
      }
    }
  },
  release: {
    pasteId: {
      doc: 'Paste ID that will be uses as default content.',
      format: Number,  
      env: 'PASTE_ID',
      arg: 'paste_id',
      default: undefined
    },
  }
});
 

config.loadFile('.env.json');

// Perform validation
config.validate({allowed: 'strict'});
 
module.exports = config;
var convict = require('convict');

convict.addFormat({
    name: 'source-array',
    validate: function(sources, schema) {
      if (!Array.isArray(sources)) {
        throw new Error('must be of type Array');
      }
  
      for (source of sources) {
        convict(schema.children).load(source).validate();
      }
    }
  });

// Define a schema
var config = convict({
    projectName: {
        doc: 'Project display name.',
        format: String
    },
    projectTag: {
        doc: 'Project tag.',
        format: String
    },
    projectTeam: {
        doc: 'Project team.',
        format: String
    },
    slackChannel: {
        doc: 'Slack channel.',
        format: 'url'
    },
    phabricator: {
      url: {
        doc: 'Url to phabricator.',
        format: 'url',   
      },
      task: {
        customFields: {
            doc: 'Slack channel field.',
            format: String
        }
      }
    },
    releases: {
        doc: 'A list of releases.',
        format: Array,
        default: [],
        children: {
            platform: {
                doc: 'Platform',
                format: String,
                default: 'phabricator'
            },
            previousVersion: {
                doc: 'previousVersion',
                format: String
            },
            nextVersion: {
                doc: 'nextVersion',
                format: String
            },
            releaseDate: {
                doc: 'releaseDate',
                format: String
            },
            releaseTimeFrom: {
                doc: 'releaseTimeFrom',
                format: String
            },
            releaseTimeTo: {
                doc: 'releaseTimeTo',
                format: String
            },
            owner: {
                doc: 'owner',
                format: String
            },
            projects: {
                doc: 'projects',
                format: Array
            },
            subscribers: {
                doc: 'subscribers',
                format: Array
            },
            additionalInfo: {
                doc: 'additionalInfo',
                format: Array
            }
        }
    }
  });

  module.exports = config;
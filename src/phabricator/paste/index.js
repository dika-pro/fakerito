const phabricatorApi = require('../index');

module.exports = {
    getPasteByIds: function(ids) {
        return phabricatorApi.exec('paste.search', {
            constraints: {
              ids
            },
            attachments: {
              content: true
            }
        });
    }
}
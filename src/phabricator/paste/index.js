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
    },
    updatePaste: function(id, data) {
      return phabricatorApi.exec('paste.edit', {
        transactions: [
            {
              type: 'text',
              value: data
            }
          ],
          objectIdentifier: id
      });
  }
}
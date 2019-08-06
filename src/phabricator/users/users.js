const phabricatorApi = require('../index');

module.exports = {
    getUsersByUsernames: function(usernames) {
        return phabricatorApi.exec('user.search', {
            constraints: {
              usernames: usernames
            }
        });
    }
}
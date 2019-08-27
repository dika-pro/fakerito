const createCanduit = require('canduit');
let connection = null;

module.exports = {
    /**
     * 
     * @param {Object} [params] 
     * @param {String} params.api 
     * @param {String} params.token
     */
    connect(params) {
        return new Promise(function(resolve, reject){
            // Create and authenticate client
            createCanduit(params || {}, (err, canduit) => {
                if (err) {
                    reject(err);
                } else {
                    connection = canduit;
                    resolve(canduit)
                }
            });
         });
    },

    getConnection() {
        return connection;
    },

    async exec (api, query) {
        return new Promise(function(resolve, reject){
            connection.exec(api, query, 
                function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data)
                }
            });
        });
    }
};
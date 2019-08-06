const createCanduit = require('canduit');
let connection = null;

module.exports = {
    connect() {
        return new Promise(function(resolve, reject){
            // Create and authenticate client
            createCanduit((err, canduit) => {
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
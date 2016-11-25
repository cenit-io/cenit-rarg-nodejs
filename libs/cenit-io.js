module.exports = function (api_path, access_key, access_token) {
    var headers = {
            'X-User-Access-Key': access_key,
            'X-User-Access-Token': access_token,
            'Content-Type': 'application/json'
        },

        get = function (model, id, callback) {
            var request = require('request'),
                options = {
                    url: api_path + '/setup/' + model + '/' + id,
                    headers: headers
                };

            request(options, function (err, response, body) {
                if (err || response.statusCode != 200) {
                    var data = err ? {} : JSON.parse(body);

                    callback(err || data.status || response.statusMessage, null);
                } else {
                    callback(err, data);
                }
            });
        };

    return {
        access_key: access_key,
        access_token: access_token,
        api_path: api_path,

        algorithm: function (id, callback) {
            get('algorithm', id, callback);
        },

        snippet: function (id, callback) {
            get('snippet', id, callback);
        }
    }
};
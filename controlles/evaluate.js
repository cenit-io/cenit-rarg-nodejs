module.exports = function (req, res, params) {
    var parameters = params.parameters || params.params || {};

    if (typeof parameters == 'string') {
        parameters = JSON.parse(parameters.trim() || '{}');
    }

    const
        vm = require('vm'),
        context = {
            require: require,
            cenit_io: {
                access_key: params.access_key || process.env.CENIT_IO_ACCESS_KEY,
                access_token: params.access_token || process.env.CENIT_IO_ACCESS_TOKEN
            },
            params: parameters
        };

    const result = vm.runInNewContext(params.code, context, 'stack.vm');

    res.json(result);
};
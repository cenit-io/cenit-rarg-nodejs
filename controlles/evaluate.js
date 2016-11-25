module.exports = function (req, res, params) {
    var parameters = params.parameters || params.params || {},
        access_key = req.header('x-user-access-key'),
        access_token = req.header('x-user-access-token'),
        api_path = process.env.CENIT_IO_API_PATH,
        cenit_io = require('../libs/cenit-io')(api_path, access_key, access_token),

        run = function (code) {
            var vm = require('vm'),
                context = { require: require, cenit_io: cenit_io, params: parameters },
                result;

            try {
                result = vm.runInNewContext(code, context, 'stack.vm');
                res.json(result);
            } catch (e) {
                res.status(500).send(e.stack);
            }
        },

        get_and_run = function (id) {
            cenit_io.algorithm(id, function (err, alg) {
                if (err) return res.status(500).send(err);

                cenit_io.snippet(alg.snippet.id, function (err, snippet) {
                    if (err) return res.status(500).send(err);

                    run(snippet.code);
                });
            });
        };

    if (typeof parameters == 'string') {
        parameters = JSON.parse(parameters.trim() || '{}');
    }

    if (params.id) {
        get_and_run(params.id);
    } else {
        var code = params.code || '',
            match = code.match(/^@id:([a-f0-9]+)$/i);

        if (match) {
            get_and_run(match[1]);
        } else {
            run(code);
        }
    }
};
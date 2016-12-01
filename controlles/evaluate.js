module.exports = function (request, response, params) {
    var parameters = params.parameters || params.params || {},
        access_key = request.header('x-user-access-key'),
        access_token = request.header('x-user-access-token'),
        api_path = process.env.CENIT_IO_API_PATH,
        cenit_io = require('../libs/cenit-io')(api_path, access_key, access_token),

        done = function (data) { response.json(data) },

        raise = function (e) {
            if (typeof e != 'object') {
                response.status(500).send(String(e));
            } else if (e instanceof Error) {
                response.status(500).send(e.stack);
            } else {
                response.status(500).send(e.toString());
            }
        },

        run = function (code) {
            var vm = require('vm'),
                context = { require: require, done: done, raise: raise, cenit_io: cenit_io, params: parameters };

            try {
                vm.runInNewContext(code, context, 'stack.vm');
            } catch (e) {
                response.status(500).send(e.stack);
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
// Include the cluster module
var cluster = require('cluster'),
    express = require('express'),
    bodyParser = require('body-parser'),
    env = require('node-env-file'),
    path = require('path'),
    fs = require('fs'),
    envFile = path.join(__dirname, '.env');

if (fs.existsSync(envFile)) env(envFile);

// Code to run if we're in the master process
if (cluster.isMaster) {

    var maxWorkers = 4,

        // Handle worker messages
        onMessage = function (message) {
            console.log('We got a message!');
            console.log(message);
        },

        // Check workers to restart
        checkWorkers = function () {
            for (var i in cluster.workers) {
                if (cluster.workers[i].toRestart && cluster.workers[i].state === 'listening') {
                    cluster.workers[i].disconnect();
                }
            }
        },

        // Create worker
        createWorker = function () {
            var worker = cluster.fork();
            worker.on('message', onMessage);
            worker.on('online', function () {
                console.info('Worker #' + worker.id + ' is online.');
                checkWorkers();
            });
            return worker;
        };

    // Create a worker for each CPU
    for (var i = 0; i < maxWorkers; i++) {
        createWorker();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        if (worker.suicide) {
            console.warn('Worker ' + worker.id + ' restarted.');
        } else {
            console.error('Worker ' + worker.id + ' died.');
        }
        createWorker();
    });

    // Disconnect
    cluster.on('disconnect', function (worker) {
        console.warn('Disconnect, restarting worker #' + worker.id);
        worker.kill();
    });

} else {
    // Code to run if we're in a worker process
    var app = express()
        worker = cluster.worker;

    app.set('port', (process.env.PORT || 5000));

    app.use(express.static(__dirname + '/public'));
    app.use('/public', express.static(__dirname + '/public'));

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    // views is directory for all template files
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    app.get('/', function (request, response) {
        console.log('Worker #%d process GET request.', worker.id);
        require('./controlles/index')(request, response);
    });

    app.post('/', function (request, response) {
        console.log('Worker #%d process POST request.', worker.id);
        require('./controlles/evaluate')(request, response, request.body);
    });

    app.listen(app.get('port'), function () {
        console.log('Worker #%d is running on port %d.', worker.id, app.get('port'));
    });
}





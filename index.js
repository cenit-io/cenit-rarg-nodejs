var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();



app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

app.post('/', function (request, response) {
    require('./controlles/evaluate')(request, response, request.body);
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});



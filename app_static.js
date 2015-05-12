var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var fs = require('fs');
var logger = require('morgan');
var path = require('path');
var request = require('request');
var routes = require('./routes/index.js');
var users = require('./routes/users.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use('/', routes);

app.use(express.static(__dirname + '/Saves_bin'));

app.use('/avatars', express.static(__dirname + '/avatars'));

app.post('/deploy', function(req, res) {
    var sess = req.session;
    if (req.query.DK == '3xfKxZLKdkgQ8TI4ZpsfJc8W9zqYF0PcM8r8e948a3JaX1Fc99V6oY22lV64VAptYY4V09l34r0m5VoMGIYl9yfeH6x1M5m6') {
        console.log('QUITING FOR DEPLOY!');
        process.exit(0);
    } else {
        console.log('ERR_WRONG_DEPLOY_KEY!');
        res.end('ERROR');
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Server listening at port %d', port);
});

module.exports = app;

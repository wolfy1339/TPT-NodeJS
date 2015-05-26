var express = require('express');
var app = express();
var child;
var cp = require('child_process');
var spawn = cp.spawn;
var port = process.env.PORT || 3011;

function startApp(e) {
    child = spawn('node', [e]);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function (data) {
        var str = data.toString();
        console.log(str);
    });
    child.on('close', function (code) {
        console.log('Process exit code %d', code);
    });
}


function restartApp(req, res, e) {
    spawn('git', ['pull']);   // git pull
    spawn('npm', ['install']); // npm install
    child.kill();
    startApp(e || 'app.js');
    res.send('Ok');
}

app.post('/', restartApp);
app.listen(port, function() {
    console.log('Server listening at port %d', port);
    startApp('app.js');
});

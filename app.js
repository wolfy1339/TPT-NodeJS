var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var islogedin = false;
var routes = require('./routes/index.js');
var users = require('./routes/users.js');
var request = require('request');
var app = express();
var session = require('express-session');
app.use(session({
    //Change if security problem is detected!
    secret: 'BrilliantMindsoftheTPTservers'
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var TPT = {};
TPT.islogedin = false;
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.all('/Startup.json', function (req, res) {
    var fs = require('fs');
    var path = require('path');

    var filePath = path.join(__dirname, 'motd.txt');

    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function (err, data) {
        var sess = req.session;
        if (!err) {
            console.log('received data: ' + data);
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write('{"Updates":{"Stable":{"Major":90,"Minor":2,"Build":322,"File":"\/Download\/Builds\/Build-322\/-.ptu"},"Beta":{"Major":90,"Minor":1,"Build":320,"File":"\/Download\/Builds\/Build-320\/-.ptu"},"Snapshot":{"Major":83,"Minor":3,"Build":208,"Snapshot":1346881831,"File":"\/Download\/Builds\/TPTPP\/-.ptu"}},"Notifications":[],"Session":false,"MessageOfTheDay":"' + data + '"}');
            res.end();
        } else {
            console.log(err);
        }

    });
});

app.all('/Browse/Tags.json', function (req, res) {
    var sess = req.session;
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write('{"TagTotal": 1, "Results": 1, "Tags": [{"Tag": "Tags", "Count": 1}, {"Tag": "are", "Count": 1}, {"Tag": "not", "Count": 1}, {"Tag": "yet", "Count": 1}, {"Tag": "implemented.", "Count": 1}');
    res.end();
});

var filePath;
app.all('/Browse.json', function (req, res) {
    var sess = req.session;
    var fs = require('fs');
    var path = require('path');
    if (!req.query.Search_Query) {
        filePath = path.join(__dirname, 'saves.txt');
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, function (err, data) {
            if (!err) {
                console.log('received data: ' + data);
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write('{"Count":517032, "Saves":[' + data + ']}');
                res.end();
            } else {
                console.log(err);
            }

        });
    } else {
        if (req.query) {
            //begin of query proc
            if (req.query.Search_Query) {
                if (req.query.Search_Query.indexOf('ID:') != -1) {
                    var sID = req.query.Search_Query.split('ID:')[1];
                    console.log(sID);
                }
            }
            //end of query proc.
            filePath = path.join(__dirname, 'Saves_1', 'save_' + sID + '.txt');

            fs.readFile(filePath, {
                encoding: 'utf-8'
            }, function (err, data) {
                if (!err) {
                    console.log('received data: ' + data);
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.write('{"Count":517032, "Saves":[' + data + ']}');
                    res.end();
                } else {
                    console.log(err);
                }

            });
        }
    }
});

app.all("/Browse/View.json", function (req, res) {
    var sess = req.session;
    var fs = require('fs');
    var path = require('path');

    var filePath = path.join(__dirname, 'Saves', 'save_' + req.query.ID + '.txt');

    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function (err, data) {
        if (!err) {
            console.log('received data: ' + data);
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write('{"Count":517032, "Saves":[' + data + ']}');
            res.end();
        } else {
            console.log(err);
        }

    });
});

app.all("/Browse/Comments.json", function (req, res) {
    var sess = req.session;
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write('[{"Username": "Io", "UserID": "1", "Gravatar": "", "Text": "Sorry, comments are disabled.", "Timestamp":  "1428177544", "FormattedUsername": "Io"}]');
    res.end();
});

app.get('/', function (req, res) {
    var sess = req.session;
    console.log(islogedin);
    res.render('index', {
        islogedin: islogedin
    });
});

app.get('/login.html', function (req, res) {
    var sess = req.session;
    if (!islogedin) {
        res.render('login', {});
    } else {
        res.redirect("/");
    }
});

app.post('/login.html', function (req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    if (req.body.pass == "pass") {
        islogedin = true;
        res.end('done');
    } else {
        res.end('ERR_USER_OR_PASS_WRONG');
    }
});

app.get('/motd.html', function (req, res) {
    var sess = req.session;
    if (islogedin) {
        res.render('motd', {});
    } else {
        res.redirect("/");
    }
});

app.post('/motd.html', function (req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    if (islogedin) {
        var fs = require('fs');
        fs.writeFile('motd.txt', req.body.motd, function (err) {
            if (err) {
                res.end(err);
                return console.log(err);
            }
            console.log('The file was saved!');
        });
        res.end('done');
    } else {
        res.end('ERR_NOT_LOGED_IN');
    }
});

app.get('/Login.json', function (req, res) {
    var sess = req.session;
    res.writeHead(200, {
        'content-type': 'text/html'
    });
    res.end(
        '<form action="/Login.json" enctype="multipart/form-data" method="post">' +
        '<input type="text" name="Username"><br>' +
        '<input type="text" name="Hash"><br>' +
        '<input type="submit" value="Login">' +
        '</form>'
    );
});

app.post('/Login.json', function (req, res) {
    if (req.get('X-Auth-User-Id') && req.get('X-Auth-Session-Key')) {
        //validation here
    }
    var sess = req.session;
    var fs = require('fs');
    /*var formidable = require('formidable');
    var util = require('util');
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, Data) {
        console.log("Username: " + Data.Hash);
        var formData = {
            // Pass a simple key-value pair
            Username: util.inspect(Data),
            Hash: 'redacted'
        };
        request.post({
            url: 'http://powdertoy.co.uk/Login.json',
            formData: formData
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body); res.writeHead(200, {
                'Content-Type': 'text/json'
            }); res.write(body);
        });
        request.post({
            url: 'http://powdertoy.co.uk/Login.json',
            form: {
                Username: 'io',
                Hash: 'redacted'
            }
        }, function (err, httpResponse, body) {
            console.log(body);
            res.writeHead(200, {
                'Content-Type': 'text/json'
            });
            res.write(body);
            res.end();
        });
    });*/
    var formidable = require('formidable');
    var util = require('util');
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, Data) {
        var filePath = path.join(__dirname, 'Users', Data.Username + '.txt');
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, function (err, data) {
            if (!err) {
                //Separate data in an array.
                var dataa = data.split('!EOL!');
                if (dataa[1] == Data.Hash) {
                    res.writeHead(200, {
                        'Content-Type': 'text/json'
                    });
                    var datats = '{"Status":1,"UserID":' + dataa[2] + ',"SessionID":"aa0aa00aaaa000aaaa0000aaa0","SessionKey":"0000000000","Elevation":"' + dataa[3] + '","Notifications":[]}';
                    TPT.islogedin = true;
                    TPT.User = Data.Username;
                    res.write(datats);
                    res.end();
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/json'
                    });
                    res.write('{Error: "Incorrect username or password"}');
                    res.end();
                }
                //}
            } else {
                console.log(err);
            }
        });
    });
});

app.post('/Save.api', function (req, res) {
    var sess = req.session;
    var fs = require('fs');
    var formidable = require('formidable');
    var util = require('util');
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, sData, sData2) {
        if (!err) {
            var util = require('util');
            var fs = require('fs');
            var sID = fs.readFileSync('cID.txt', "utf8");
            fs.writeFile(path.join(__dirname, 'cID.txt'), parseInt(sID) + 1, function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("Current ID was updated!");
            });
            fs.writeFile(path.join(__dirname, 'Saves', 'save_' + sID + '.txt'), '{"ID":' + sID + ',"Favourite":false,"Score":1,"ScoreUp":1,"ScoreDown":0,"Views":1,"ShortName":"' + sData.Name + '","Name":"' + sData.Name + '","Description":"' + sData.Description + '", "DateCreated":0,"Date":0,"Username":"' + TPT.user + '","Comments":0,"Published":' + sData.Publish + ',"Version":0,"Tags":[]}', function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("Save data saved!");
            });
            fs.writeFile(path.join(__dirname, 'Saves_1', 'save_' + sID + '.txt'), '{"ID":' + sID + ',"Created":1,"Updated":1,"Version":1,"Score":2,"ScoreUp":2,"ScoreDown":0,"Name":"' + sData.Name + '","ShortName":"' + sData.Name + '", "Username":"' + TPT.User + '","Comments":1,"Published": "' + sData.Publish + '"}', function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("Save data part 2 saved!");
            });
            fs.createReadStream(sData2.Data.path).pipe(fs.createWriteStream(path.join(__dirname, 'Saves_bin', sID + '.cps')));
            fs.createReadStream(sData2.Data.path).pipe(fs.createWriteStream(path.join(__dirname, 'Saves_bin', sID + '_1.cps')));
            res.writeHead(200, {
                'Content-Type': 'text/json'
            });
            var datats = 'OK ' + sID;
            res.write(datats);
            res.end();
        } else {
            console.log(err);
        }
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = process.env.PORT || 3001;

app.listen(port, function () {
    console.log('Server listening at port %d', port);
});

module.exports = app;

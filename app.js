var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var crypto = require('crypto');
var favicon = require('serve-favicon');
var fs = require('fs');
var islogedin = false;
var logger = require('morgan');
var md5sum = crypto.createHash('md5');
var path = require('path');
var request = require('request');
var routes = require('./routes/index.js');
var sanitize = require('sanitize-filename');
var session = require('express-session');
var TPT = {};
TPT.islogedin = false;
var users = require('./routes/users.js');
var wTPTUser = '';
var wTPTislogedin = false;

// Some variables to tell if you are running the server on Linux or Windows and 64 bit/32 bit
var isWindows = false;
var isX64 = true;

app.use(session({
    //Change if security problem is detected!
    secret: 'BrilliantMindsoftheTPTservers'
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(__dirname, 'uploads')));

//app.use('/', routes);
app.use('/users', users);
app.all('/Startup.json', function(req, res) {
    var filePath = path.join(__dirname, 'motd.txt');

    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        var sess = req.session;
        if (!err) {
            console.log('received data: ' + data);
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write('{"Updates":{"Stable":{"Major":90,"Minor":2,"Build":322,"File":"\/Download\/Builds\/Build-' +
                '322\/-.ptu"},"Beta":{"Major":90,"Minor":1,"Build":320,"File":"\/Download\/Builds\/Build-320\/-.ptu"},"Snapshot":' +
                '{"Major":83,"Minor":3,"Build":208,"Snapshot":1346881831,"File":"\/Download\/Builds\/TPTPP\/-.ptu"}},"Notifications":' +
                '[],"Session":false,"MessageOfTheDay":"' + data + '"}');
            res.end();
        } else {
            console.log(err);
        }

    });
});

// I'm not completely sure this will work, but it should
app.get('/GetScript.api', function(req, res) {
    var sess = req.session;
    var filePath = path.join(__dirname, 'Scripts', 'id_' + sanitize(req.query.Author) + sanitize(req.query.Filename) + '.lua');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write(data);
            res.end();
        } else {
            console.log(err);
        }
    });
});

app.all('/Browse/Tags.json', function(req, res) {
    var sess = req.session;
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.write('{"TagTotal": 1, "Results": 1, "Tags": [{"Tag": "Tags", "Count": 1}, {"Tag": "are", "Count": 1}, {"Tag": "not",' +
        '"Count": 1}, {"Tag": "yet", "Count": 1}, {"Tag": "implemented.", "Count": 1}');
    res.end();
});

app.all('/Browse.json', function(req, res) {
    var filePath;
    var sess = req.session;
    if (!req.query.Search_Query) {
        filePath = path.join(__dirname, 'saves.txt');
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, function(err, data) {
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
                    filePath = path.join(__dirname, 'Saves_1', 'save_' + sanitize(sID) + '.txt');
                }
            }
            //end of query proc.

            fs.readFile(filePath, {
                encoding: 'utf-8'
            }, function(err, data) {
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

app.all('/Browse/View.json', function(req, res) {
    var sess = req.session;

    var filePath = path.join(__dirname, 'Saves', 'save_' + sanitize(req.query.ID) + '.txt');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
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

app.get('/verify/:id', function(req, res) {
    var id = req.params.id;
    var vidp = path.join(__dirname, 'vid', id + '.txt');
    if (fs.existsSync(vidp)) {
        fs.readFile(vidp, {
            encoding: 'utf-8'
        }, function(err, data) {
            if (err) {
                console.log(err);
            }
            var dataa = data.split('!EOL!');
            var Uname = dataa[0];
            var Hash = dataa[1];
            var uID = dataa[4];
            fs.writeFile(path.join(__dirname, 'Users', Uname + '.txt'), Uname + '!EOL!' + Hash + '!EOL!' + uID + '!EOL!None!EOL!?!EOL!No' + ' biography set.', function(err) {
                if (err) {
                    return console.log(err);
                }
                fs.unlink(vidp, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Verifying request ' + id + '...');
                    console.log('User ' + Uname + ' Registered!');
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.write('{DONE}');
                    res.end();
                });
            });
        });
    } else {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write('{ERR_INVALID_VID}');
        res.end();
        console.log(vidp);
    }
});

app.all('/deploy', function(req, res) {
    var sess = req.session;
    var spawn = require('child_process').spawn;
    if (islogedin) {
        if (isWindows) {
            spawn('deploy.bat');
        } else {
            spawn('deploy.sh');
        }
        console.log('Halting for deploy!');
        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.write('{Code: Goodbye, see you later.}');
        res.end();
        process.exit(0);
    } else {
        var php = require('phpjs');
        var ipLow = php.ip2long('192.30.252.0');
        var ipHigh = php.ip2long('192.30.255.255');
        // We use this header to detect the IP
        var ip = php.ip2long(req.get('X-Forwarded-For'));
        if (ip >= ipLow && ip <= ipHigh) {
            if (isWindows) {
                spawn('deploy.bat');
            } else {
                spawn('deploy.sh');
            }
            res.writeHead(200, {
                'Content-Type': 'text/json'
            });
            res.write('{Code: Goodbye, see you later.}');
            res.end();
            console.log('Halting for deploy!');
            process.exit(0);
        } else {
            res.writeHead(401, {
                'Content-Type': 'text/json'
            });
            res.write('{Code: Error. Log in first.}');
            res.end();
            console.log(req.ip);
        }
    }
});

// I'm not completely sure this will work, but it should
app.get('/Browse/Comments.json', function(req, res) {
    var sess = req.session;
    var filePath = path.join(__dirname, 'Comments', 'id_' + sanitize(req.query.ID) + '.txt');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            res.writeHead(200, {
                'Content-Type': 'text/json'
            });
            res.write(data + '{"Username": "Io", "UserID": "1", "Gravatar": "", "Text":".", ' +
                '"Timestamp":"1428177544","FormattedUsername": "Io"}]');
            res.end();
        } else {
            console.log(err);
        }
    });
    //}
});

// I'm not completely sure this will work, but it should
app.post('/Browse/Comments.json', function(req, res) {
    var sess = req.session;
    var formidable = require('formidable');
    var util = require('util');
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, Data) {
        if (!err) {
            console.log(util.inspect(TPT));
            var fs = require('fs');
            var prevdata = fs.readFileSync(path.join(__dirname, 'Comments', 'id_' + sanitize(req.query.ID) + '.txt'), 'utf8');
            fs.writeFile(path.join(__dirname, 'Comments', 'id_' + sanitize(req.query.ID) + '.txt'), prevdata +
                '{"Username":"' + TPT.User + '","UserID":"TPT.ID","Gravatar":"\/Avatars\/' + TPT.ID + '_40.png","Text":"' + Data.Comment +
                '","Timestamp":"1","FormattedUsername":"' + TPT.User + '"}, ',
                function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log('Comment data saved!');
                });
            res.writeHead(200, {
                'Content-Type': 'text/json'
            });
            res.write('{"Status":1}');
            res.end();
        } else {
            console.log(err);
        }
    });
});

app.get('/fp.html', function(req, res) {
    var sess = req.session;
    if (islogedin) {
        res.render('fp', {});
    } else {
        res.redirect('index.html');
    }
});

app.get('/logout.html', function (req, res) {
    var sess = req.session;
    res.redirect('index.html');
    islogedin = false;
});

app.get('/profile.html', function(req, res) {
    var sess = req.session;
    // req.query.Name.split('/')[0].split('\')[0] avoids users from doing unwanted thing with the path
    var filePath = path.join(__dirname, 'Users', sanitize(req.query.Name) + '.txt');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            var dataa = data.split('!EOL!');
            res.render('profile', {
                id: dataa[2],
                username: dataa[0],
                elev: dataa[3],
                reg: dataa[4],
                bib: dataa[5]
            });
        } else {
            res.render('profile_error', {
                username: req.query.Name
            });
        }
    });
});

app.post('/fp.html', function(req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    if (islogedin) {
        fs.writeFile('saves.txt', req.body.fp, function(err) {
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

app.get('/User.json', function(req, res) {
    var sess = req.session;
    // req.query.Name.split('/')[0].split('\')[0] avoids users from doing unwanted thing with the path
    var filePath = path.join(__dirname, 'Users', sanitize(req.query.Name) + '.txt');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            var dataa = data.split('!EOL!');
            console.log('{"User":{ "Username": "' + dataa[0] + '", "ID": ' + dataa[2] + ', "Avatar":"\/Avatars\/' + dataa[2] + '_512.png", "Elevation": "' +
                dataa[3] + '", "Saves":{}, "Forum":{}, "Registered": "' + dataa[4] + '", "Biography": "' + dataa[5] + '"}}');
            res.writeHead(200, {
                'Content-Type': 'text/json'
            });
            res.end('{"User":{ "Username": "' + dataa[0] + '", "ID": ' + dataa[2] + ', "Avatar":"\/Avatars\/' + dataa[2] +
                '_512.png", "Elevation": "' + dataa[3] + '", "Saves":{}, "Forum":{}, "Registered": "' + dataa[4] + '", "Biography": "' +
                dataa[5] + '"}}');
        } else {
            console.log(err);
        }
    });
});

app.get('/', function(req, res) {
    var sess = req.session;
    res.render('index', {
        islogedin: islogedin,
        wtptislogedin: wTPTislogedin,
        wtptusr: wTPTUser
    });
});

app.get('/login.html', function(req, res) {
    var sess = req.session;
    if (!islogedin) {
        res.render('login', {});
    } else {
        res.redirect('index.html');
    }
});

app.get('/upload.html', function(req, res) {
    var sess = req.session;
    if (!islogedin) {
        res.render('upload', {});
    } else {
        res.redirect('index.html');
    }
});

app.get('/upload.html', function(req, res) {
    var sess = req.session;
    if (!islogedin) {
        fs.readFile(req.files.file.path, function(err, data) {
            // ...
            var Path = __dirname + '/uploads/' + req.files.file.name;
            fs.writeFile(Path, data, function(err) {
                res.redirect('index.html');
            });
        });
    } else {
        res.redirect('index.html');
    }
});

app.post('/login.html', function(req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    if (req.body.pass == 'pass') {
        islogedin = true;
        res.end('done');
    } else {
        res.end('ERR_USER_OR_PASS_WRONG');
    }
});

app.get('/usr_login.html', function(req, res) {
    var sess = req.session;
    if (!wTPTislogedin) {
        res.render('usr_login', {});
    } else {
        res.redirect('index.html');
    }
});

app.post('/usr_login.html', function(req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    var filePath = path.join(__dirname, 'Users', sanitize(req.body.user) + '.txt');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function(err, data) {
        if (!err) {
            //Separate data in an array.
            var dataa = data.split('!EOL!');
            if (dataa[1] == md5sum.update(req.body.user + '-' + md5sum.update(req.body.pass).digest('hex')).digest('hex')) {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                wTPTislogedin = true;
                wTPTUser = req.body.user;
                res.write('done');
                res.end();
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.write('Incorrect username or password');
                res.end();
            }
        } else {
            console.log(err);
        }
    });
});

app.get('/passwd.html', function(req, res) {
    var sess = req.session;
    if (wTPTislogedin) {
        res.render('passwd', {});
    } else {
        res.redirect('index.html');
    }
});

app.post('/passwd.html', function(req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    fs.readFile(vidp, {encoding: 'utf-8'}, function(err, data) {
        if (err) {
            console.log(err);
        }
        var dataa = data.split('!EOL!');
        var Hash = dataa[1];
        var uID = dataa[4];
        var Reg = dataa[5];
        var Bib = dataa[6];
        fs.writeFile(path.join(__dirname, 'Users', wTPTUser + '.txt'), 
        wTPTUser + '!EOL!' + md5sum.update(md5sum.update(wTPTUser).digest('hex') + '-' + md5sum.update(req.body.pass).digest('hex')).digest('hex') + '!EOL!' + uID + '!EOL!' + Reg + '!EOL!' + Bib, 
        function(err) {
            if (err) {
                console.log(err);
            }
            console.log('User ' + wTPTUser + ' changed his/her password');
        });
    });
    res.end('done');
});

app.get('/register.html', function(req, res) {
    var sess = req.session;
    if (!islogedin) {
        res.render('register', {});
    } else {
        res.redirect('index.html');
    }
});

app.post('/register.html', function(req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    var uID = fs.readFileSync('uID.txt', 'utf8');
    fs.writeFile(path.join(__dirname, 'uID.txt'), parseInt(uID) + 1, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('Current uID was updated!');
    });
    res.writeHead(200, {
        'content-type': 'text/html'
    });
    if (req.body.erc == 'BMNNET++') {
        if (!fs.existsSync((path.join(__dirname, 'Users', sanitize(req.body.user) + '.txt')))) {
            fs.writeFile(path.join(__dirname, 'vid', req.body.user + '123abc' + '.txt'),
            req.body.user + '!EOL!' + md5sum.update(req.body.user + '-' + md5sum.update(req.body.pass).digest('hex')).digest('hex') + '!EOL!' + uID + '!EOL!None',
            function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log('User ' + req.body.user + ' Registered!');
            });
        } else {
            console.log('ERROR1');
            req.end('ERR_USER_EXISTS');
        }
        console.log('ERROR2');
        res.end('done');
    } else {
       console.log('ERROR3');
        res.end('ERROR');
    }
});

app.get('/motd.html', function(req, res) {
    var sess = req.session;
    if (islogedin) {
        res.render('motd', {});
    } else {
        res.redirect('index.html');
    }
});

app.post('/motd.html', function(req, res) {
    var sess = req.session;
    //In this we are assigning user to sess.user variable.
    //user comes from HTML page.
    if (islogedin) {
        var fs = require('fs');
        fs.writeFile('motd.txt', req.body.motd, function(err) {
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

app.get('/Login.json', function(req, res) {
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

app.post('/Login.json', function(req, res) {
    if (req.get('X-Auth-User-Id') && req.get('X-Auth-Session-Key')) {
        //validation here
    }
    var sess = req.session;
    var formidable = require('formidable');
    var util = require('util');
    var request = require('request');
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, Data) {
        var filePath = path.join(__dirname, 'Users', sanitize(Data.Username) + '.txt');
        fs.readFile(filePath, {
            encoding: 'utf-8'
        }, function(err, data) {
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
                    TPT.ID = dataa[2];
                    res.write(datats);
                    res.end();
                } else {
                    request.post({
                        url: 'http://powdertoy.co.uk/Login.json',
                        form: {
                            Username: Data.Username,
                            Hash: Data.Hash
                        }
                    }, function(err, httpResponse, body) {
                        console.log(body);
                        res.writeHead(200, {
                            'Content-Type': 'text/json'
                        });
                        TPT.islogedin = true;
                        TPT.User = Data.Username;
                        //TPT.ID = dataa[2];
                        res.write(body);
                        res.end();
                    });
                }
            } else {
                request.post({
                    url: 'http://powdertoy.co.uk/Login.json',
                    form: {
                        Username: Data.Username,
                        Hash: Data.Hash
                    }
                }, function(err, httpResponse, body) {
                    console.log(body);
                    res.writeHead(200, {
                        'Content-Type': 'text/json'
                    });
                    TPT.islogedin = true;
                    TPT.User = Data.Username;
                    //TPT.ID = dataa[2];
                    res.write(body);
                    res.end();
                });
            }
        });
    });
});

app.post('/Save.api', function(req, res) {
    var sess = req.session;
    var formidable = require('formidable');
    var util = require('util');
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, sData, sData2) {
        if (!err) {
            var sID = fs.readFileSync('cID.txt', 'utf8');
            fs.writeFile(path.join(__dirname, 'cID.txt'), parseInt(sID) + 1, function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log('Current ID was updated!');
            });
            fs.writeFile(path.join(__dirname, 'Saves', 'save_' + sID + '.txt'), '{"ID":' + sID +
                ',"Favourite":false,"Score":1,"ScoreUp":1,"ScoreDown":0,"Views":1,"ShortName":"' + sData.Name + '","Name":"' + sData.Name +
                '","Description":"' + sData.Description + '", "DateCreated":0,"Date":0,"Username":"' + TPT.user +
                '","Comments":0,"Published":' + sData.Publish + ',"Version":0,"Tags":[]}',
                function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log('Save data saved!');
                });
            fs.writeFile(path.join(__dirname, 'Comments', 'id_' + sID + '.txt'), '[', function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log('Save\'s Initial Comment data saved!');
            });
            fs.writeFile(path.join(__dirname, 'Saves_1', 'save_' + sID + '.txt'), '{"ID":' + sID +
                ',"Created":1,"Updated":1,"Version":1,"Score":2,"ScoreUp":2,"ScoreDown":0,"Name":"' + sData.Name + '","ShortName":"' +
                sData.Name + '", "Username":"' + TPT.User + '","Comments":1,"Published": "' + sData.Publish + '"}',
                function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log('Save data part 2 saved!');
                });
            fs.createReadStream(sData2.Data.path).pipe(fs.createWriteStream(path.join(__dirname, 'Saves_bin', sID + '.cps')));
            fs.createReadStream(sData2.Data.path).pipe(fs.createWriteStream(path.join(__dirname, 'Saves_bin', sID + '_1.cps')));
            var spawn = require('child_process').spawn;
            if (isWindows) {
                spawn('Render', [sID + '.cps', sID], {
                    cwd: path.join(__dirname, 'Saves_bin')
                });
            } else {
                if (isX64) {
                    spawn('render64', [sID + '.cps', sID], {
                        cwd: path.join(__dirname, 'Saves_bin')
                    });
                } else {
                    spawn('render', [sID + '.cps', sID], {
                        cwd: path.join(__dirname, 'Saves_bin')
                    });
                }
            }
            // Listen for any response from the child:
            child.stdout.on('data', function(data) {
                console.log(data.toString());
            });

            // Listen for any errors:
            child.stderr.on('data', function(data) {
                console.log('There was an error: ' + data);
            });

            child.on('close', function(code) {
                console.log('Renderer closed with code: ' + code);
                fs.createReadStream(path.join(__dirname, 'Saves_bin', sID + '.pti')).pipe(fs.createWriteStream(path.join(__dirname, 'Saves_bin', sID + '_1.pti')));
                fs.createReadStream(path.join(__dirname, 'Saves_bin', sID + '-small.pti')).pipe(fs.createWriteStream(path.join(__dirname, 'Saves_bin', sID + '_1_small.pti')));
                fs.createReadStream(path.join(__dirname, 'Saves_bin', sID + '-small.pti')).pipe(fs.createWriteStream(path.join(__dirname, 'Saves_bin', sID + '_small.pti')));
            });
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

var port = process.env.PORT || 3001;

app.listen(port, function() {
    console.log('Server listening at port %d', port);
});

module.exports = app;

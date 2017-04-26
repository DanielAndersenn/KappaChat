
//Module Dependencies
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var path = require('path');
var UserModel = require('./UserModel');
var io = require('socket.io').listen(server);
var soap = require('soap');


//Configure the application and prepare for sessionhandling
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser('KappaChat '));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, 'images')));
});

app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});
/*
Helper Functions
*/
function authenticate(name, pass, callback) {
console.log('Trying to log in user with Username: ' + name + ' Pass: ' + pass);
  var url = 'http://javabog.dk:9901/brugeradmin?wsdl';
  var args = {':arg0': name, ':arg1': pass};

  soap.createClient(url, function(err, client) {
    console.log("Value of err: " + err);
    client.BrugeradminImplService.BrugeradminImplPort.hentBruger(args, function(err, result) {

        if(result) {
          console.log(result);
          var user = new UserModel.User(result.return.brugernavn);
          console.log(user.userName);
          callback(null, user);
        }
        else {
          console.log(err);
          callback(new Error('Cannot authenticate user'));
        }
    });
  });

};

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

//Metoden bliver kaldt når en klient forbinder gennem websocket gennem javascript
io.on('connection', function(socket) {
  console.log('Client connected with socket ID: ' + socket.id);
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  }); // end socket.on.chat message

}); // end io.on


//Routing controll

app.get("/", function (req, res) {

    if (req.session.user) {
        res.send("Welcome " + req.session.user.userName + "<br>" + "<a href='/logout'>logout</a>");
    } else {
        res.sendfile(__dirname + '/login.html');
    }
});

app.get("/login", function (req, res) {
    res.sendfile(__dirname + '/login.html');
});

app.post("/login", function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {

            req.session.regenerate(function () {

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.userName + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/chat');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/login');
        }
    });
});

app.get('/chat', requiredAuthentication, function(req, res) {
   res.sendfile(__dirname + '/chat.html');
});

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

// Should'nt be accessable for users
app.get('/emote.js', requiredAuthentication, function(req, res) {
  res.sendfile(__dirname + '/scripts/emote.js');
})

server.listen(3000, function() {
  console.log("Listening for connections on port 3000 ...");
});

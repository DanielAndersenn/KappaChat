//Module Dependencies
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var path = require('path');
var UserModel = require('./DataModels/UserModel');
var io = require('socket.io').listen(server);
var soap = require('soap');
var db = require('./scripts/database.js');


//Configure the application and prepare for sessionhandling
app.configure(function () {
    app.use(express.bodyParser({strict: false}));
    app.use(express.cookieParser('KappaChat'));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, 'images')));
    try{
      db.connect();
      console.log('Database connection successfully made!');
    }catch(err) {

      console.log('Database connection failed! ' + err);
    }
});

//Method for making a soap call to javabog
function authenticate(name, pass, callback) {
writeToConsoleLog('Trying to log in user with Username: ' + name + ' Pass: ' + pass + ' using SOAP');
  var url = 'http://javabog.dk:9901/brugeradmin?wsdl';
  var args = {':arg0': name, ':arg1': pass};

  soap.createClient(url, function(err, client) {
    writeToConsoleLog('Value of err: ' + err);

    //Always returns err=null irregardless of whether authentication failed or not
    if(client) {
    client.BrugeradminImplService.BrugeradminImplPort.hentBruger(args, function(err, result) {

      try{
        writeToConsoleLog(result);
        var user = new UserModel.User(result.return.brugernavn);
        callback(null, user);
      }catch(err) {
        callback(new Error('Could not authenticate user. Please try again'), null  );
      }



      });
    }//end if
    else {
      callback(new Error('Javabog.dk is offline. Contact Jakob Nordfalk for technical support!'), null);
    }


  });

};

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'You need to log in';
        res.redirect('/login');
    }
}

function writeToConsoleLog(msg) {
  console.log(msg);
  io.emit('console input', msg);
}

//Metoden bliver kaldt når en klient forbinder gennem websocket fra chat.html
io.on('connection', function(socket) {
  writeToConsoleLog('Client connected with socket ID: ' + socket.id);
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    writeToConsoleLog(msg);
    db.send(msg);
  }); // end socket.on.chat message

}); // end io.on


//Routing control
app.get("/", function (req, res) {

  if(requiredAuthentication) {
    res.redirect('/chat');
  } else {
    res.sendfile(__dirname + '/login.html');
  }
});

//Route for login
app.get("/login", function (req, res) {
      res.sendfile(__dirname + '/login.html');

});

app.post("/login", function (req, res) {
    res.clearCookie('errMsg');
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
            writeToConsoleLog('User ' + user.userName + ' joined the chat!');
            io.emit('server info', 'User ' + user.userName + ' joined the chat!');
            req.session.regenerate(function () {

                req.session.user = user;
                res.cookie('userName', user.userName, {maxAge: 90000000});
                res.cookie('chatColor', user.chatColor, {maxAge: 90000000});
                res.redirect('/chat');

            });
        } else {
            writeToConsoleLog('Value of err: ' + err);
            res.cookie('errMsg', err.message);
            res.redirect('/login');
        }
    });
});

//Route for chat
app.get('/chat', requiredAuthentication, function(req, res) {
   res.sendfile(__dirname + '/chat.html');
});

//Route for logout
app.get('/logout', function (req, res) {
    io.emit('server info', 'User ' + req.session.user.userName + ' left the chat!');
    req.session.destroy(function () {
        res.redirect('/');
    });
});

//Route for chat.html to get emote.js
app.get('/emote.js', requiredAuthentication, function(req, res) {
  res.sendfile(__dirname + '/scripts/emote.js');
})

//REST api start
//Get all messages written by user with studynumber @param{sNumber}
app.get('/chat/api/usearch/:sNumber', function(req, res) {

  db.getMsgsByUser(req.params.sNumber, function(err, result) {
    if (result)
    {
    res.status(200).send(result);
  } else {
    res.status(503).send(err);
  }
  });


});

//Get messages sent between two dates @param{startDate}, {endDate}
app.get('/chat/api/isearch/:startDate:/endDate', function(req, res) {

  db.getMsgsByInterval(req.params.startDate, req.params.endDate, function(err, result) {
    if (result)
    {
    res.status(200).send(result);
  } else {
    res.status(503).send(err);
  }

  });
});

//Write a message to the chat without being logged in
app.put('/chat/api/sendmsg', function(req, res) {
  writeToConsoleLog("Sending chatmsg: " + req.body.msg + " through REST API");
  io.emit('chat message', req.body.msg);

  res.status(200).send("Message sent!");
});

//Authenticate against javabog.dk through this REST method @param{username} {password}
app.get('/chat/api/auth/:username/:password', function(req, res, next) {
  writeToConsoleLog('Authenticating user ' + req.params.username + ' through REST API');
  var toReturn;
  authenticate(req.params.username, req.params.password, function (err, user) {
      if (user) {
          io.emit('server info', 'User ' + user.userName + ' joined the chat!');
          toReturn = {'authenticated':'true', 'user':user};
          res.status(200).send(toReturn);

      } else {
          toReturn = {'authenticated':'false', 'error':err};
          res.status(404).send(toReturn);
      }
  });
})
//REST api end

server.listen(30022 , function() {
  console.log("Listening for connections on port 30022 ...");
});

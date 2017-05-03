
//Module Dependencies
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var path = require('path');
var UserModel = require('./DataModels/UserModel');
var io = require('socket.io').listen(server);
var soap = require('soap');
var db = require('./database.js');


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
console.log('Trying to log in user with Username: ' + name + ' Pass: ' + pass);
  var url = 'http://javabog.dk:9901/brugeradmin?wsdl';
  var args = {':arg0': name, ':arg1': pass};

  soap.createClient(url, function(err, client) {

    console.log('Value of err: ' + err);

    //Always returns err=null irregardless of whether authentication failed or not
    if(client) {
    client.BrugeradminImplService.BrugeradminImplPort.hentBruger(args, function(err, result) {
      console.log(result);

      try{
        var user = new UserModel.User(result.return.brugernavn);
        console.log(user.userName);
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
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

//Metoden bliver kaldt når en klient forbinder gennem websocket gennem javascript
io.on('connection', function(socket) {
  console.log('Client connected with socket ID: ' + socket.id);
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    db.send(msg);
  }); // end socket.on.chat message

}); // end io.on


//Routing controll

app.get("/", function (req, res) {

  if(requiredAuthentication) {
    res.redirect('/chat');
  } else {
    res.sendfile(__dirname + '/login.html');
  }
});

app.get("/login", function (req, res) {
      res.sendfile(__dirname + '/login.html');

});

app.post("/login", function (req, res) {
    res.clearCookie('errMsg');
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {
            io.emit('server info', 'User ' + user.userName + ' joined the chat!');
            req.session.regenerate(function () {

                req.session.user = user;
                res.cookie('userName', user.userName, {maxAge: 90000000});
                res.cookie('chatColor', user.chatColor, {maxAge: 90000000});
                res.redirect('/chat');

            });
        } else {
            console.log('Value of err: ' + err);
            res.cookie('errMsg', err.message);
            res.redirect('/login');
        }
    });
});

app.get('/chat', requiredAuthentication, function(req, res) {
   res.sendfile(__dirname + '/chat.html');
});

app.get('/logout', function (req, res) {
    io.emit('server info', 'User ' + req.session.user.userName + ' left the chat!');
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/emote.js', requiredAuthentication, function(req, res) {
  res.sendfile(__dirname + '/scripts/emote.js');
})

//REST api
//Get all messages written by user with studynumber @param{sNumber}
app.get('/chat/api/usearch:sNumber', function(req, res,  next) {
  //TODO Write code to look up data in mongodb and return as JSON object
  var test = {"Username":req.params.sNumber, "gay":true, "chat":"KappaChat" };
  console.log("Value of sNumber: " + req.params.sNumber);
  res.send(test);
});

//Get all messages containing keyword @param{sNumber}
app.get('/chat/api/kwsearch/:keyWord', function(req, res, next) {
  //TODO Write code to look up data in mongodb and return as JSON object


});

app.get('/chat/api/ti/:startDate:/endDate', function(req, res, next) {
  //TODO Write code to look up data in mongodb and return as JSON object


});

app.get('/chat/api/auth/:username/:password', function(req, res, next) {
  console.log('Authenticating user ' + req.params.username + ' through REST API');
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

server.listen(30022 , function() {
  console.log("Listening for connections on port 30022 ...");
});

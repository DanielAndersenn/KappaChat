var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var soap = require('soap');

// '/ . . .' is the url name
app.get('/login', function(req, res) {
   res.sendFile(__dirname + '/login.html');
});

app.get('/', function(req, res) {
   res.redirect('/login');
});

// I guess it is not correct practice to make this get
// since users then just can type localhost:3000/chat to enter chat..
app.get('/chat', function(req, res) {
   res.sendFile(__dirname + '/chat.html');

   /*
   If we had a user object we could have a boolean (isOnline)
   that is set to 'true' if the user is online (i.e. after they have logged in)
   and false othwerwise.
   If the user then tries to type this direct URL in they will be redirected
   to /login instead
   */
});

// Should'nt be accessable for users
app.get('/emote.js', function(req, res) {
  res.sendFile(__dirname + '/scripts/emote.js');
})

app.post('/login', function(req, res) {
  //res.send();
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('login', function(msg) {
    var sID = socket.id;
    var attributes = msg.split('|');

    var username = attributes[0];
    var pass = attributes[1];

    console.log('Trying to log in user with Username: ' + username + ' Pass: ' + pass);
    authenticate(username, pass);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function authenticate(username, password) {

  var url = 'http://javabog.dk:9901/brugeradmin?wsdl';
  var args = {':arg0': username, ':arg1': password};

  soap.createClient(url, function(err, client) {
    client.BrugeradminImplService.BrugeradminImplPort.hentBruger(args, function(err, result) {
        console.log(result);

        // If no error redirect to chat
        if (!err) {

        }

    }); // client end
  }); // createClient end

} // function end

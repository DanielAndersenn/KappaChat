var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var soap = require('soap');

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//Entrypoint for klienter. Vi modtager et request (req) og tilbagesender et response (res)
// '/ . . .' is the url name
app.get('/login', function(req, res) {
   res.sendFile(__dirname + '/login.html');
});

app.get('/', function(req, res) {
   //res.redirect('/login');
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

 /*
 app.post('/', function(req, res) {
   res.sendFile(__dirname + '/chat.html');
 })
 */

  //Metoden "aktiverer" når en klient sender en .emit med navnet 'chat message'

app.post('/login', function(req, res) {
  //res.send();
});

//Metoden bliver kaldt når en klient forbinder gennem websocket gennem javascript
io.on('connection', function(socket) {
  console.log('Client connected with socket ID: ' + socket.id);
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  }); // end socket.on.chat message


  //Metoden "aktiverer" når en klient sender en .emit med navnet 'login'
  socket.on('login', function(msg) {
    var sID = socket.id;
    console.log("Value of sID: " + sID);
    //Split stringen op på tegnet '|' for at separere user/pass.
    var attributes = msg.split('|');
    var username = attributes[0];
    var pass = attributes[1];

  console.log('Trying to log in user with Username: ' + username + ' Pass: ' + pass);
  //Kald metoden der authenticater mod javabog over SOAP
  //var authenticated = authenticate(username, pass);

  authenticate(username, pass, function(authenticated) {
    console.log('Value of authenticated: ' + authenticated);
    if(authenticated)
    {
    var destination = '/chat';
    sID = socket.id;
    console.log("Value of sID: " + sID);
    socket.emit('authenticated', destination);
    }
    else
      {
        //sendFile(__dirname + '/login.html');
        console.log('Test?');
      }
  });

}); // end socket.on.login

}); // end io.on

function authenticate(username, password, callback) {

  var url = 'http://javabog.dk:9901/brugeradmin?wsdl';
  var args = {':arg0': username, ':arg1': password};

  soap.createClient(url, function(err, client) {
    client.BrugeradminImplService.BrugeradminImplPort.hentBruger(args, function(err, result) {

        if(err == null) {
          console.log(result);
          callback(true);
        }
        else {
          console.log(err);
          callback(false);
        }
    });
  });
}; // function end

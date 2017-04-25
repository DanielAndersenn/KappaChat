var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var soap = require('soap');


http.listen(3000, function(){
  console.log('listening on *:3000');
});


//Entrypoint for klienter. Vi modtager et request (req) og tilbagesender et response (res)
app.get('/', function(req, res){
   res.sendFile(__dirname + '/login.html');
 });

 /*
 app.post('/', function(req, res) {
   res.sendFile(__dirname + '/chat.html');
 })
 */

//Metoden bliver kaldt når en klient forbinder gennem websocket gennem javascript
io.on('connection', function(socket){

  //Metoden "aktiverer" når en klient sender en .emit med navnet 'chat message'
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  //Metoden "aktiverer" når en klient sender en .emit med navnet 'login'
  socket.on('login', function(msg) {
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
    var destination = '/chat.html';
    socket.emit('authenticated', destination)
    }
    else
      {
        //sendFile(__dirname + '/login.html');
        console.log('Test?');
      }
  });



});

});


function authenticate(username, password, callback) {

  var url = 'http://javabog.dk:9901/brugeradmin?wsdl';
  var args = {':arg0': username, ':arg1': password};

  soap.createClient(url, function(err, client) {
    client.BrugeradminImplService.BrugeradminImplPort.hentBruger(args, function(err, result) {
        if(err==null)
        {
          console.log(result);
        callback(true);
        }else
        {
        console.log(err);
        callback(false);
        }

    });
  });


}

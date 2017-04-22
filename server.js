var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var soap = require('soap');


app.get('/', function(req, res){
   res.sendFile(__dirname + '/login.html');
 });

app.post('/', function(req, res) {
  //res.send();
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

socket.on('login', function(msg) {
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
    });
  });

}
